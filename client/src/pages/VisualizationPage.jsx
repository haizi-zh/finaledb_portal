// @flow

import * as React from 'react';
import { Component } from 'react';
import { Page, Card, Grid, Table, Form } from 'tabler-react';
import { Alert } from 'react-bootstrap';

import { connect } from 'react-redux';
import log from 'loglevel';
import PropTypes from 'prop-types';

import {
  resetBrowserEntries,
  fetchFragmentSizeSeries,
  toggleAllowFullTracks,
  // setFragmentSizeSeries,
  setDisplayRegion,
} from '../redux/actions/epiBrowserActions';
import { addDownloadItems } from '../redux/actions/downloadListActions';

import SiteWrapper from './SiteWrapper';
import SamplesTable from '../components/SamplesTable';
// import Browser from '../components/Browser';
import EpiBrowser from '../containers/EpiBrowser';
import EpiBrowserSessionUploader from '../containers/EpiBrowserSessionUploader';
import Charts from '../components/FragmentSizesChart';

// By default, the epibrowser only displays the first 10 tracks, due to performance concerns.
// However, users can elect to make it disply all tracks by toggling this switch
const FullEpiBrowserToggler = ({ tracks, allowFull, onChange }) => {
  const nTracks = Object.keys(tracks).length;
  if (nTracks > 10) {
    const label = `By default, the epibrowser only displays the first 10 tracks, due to performance concerns. Your selected sample set contains ${nTracks} tracks. Displaying all of them may have an impact on the browser performance. Do you want to proceed anyway?`;
    return (
      <div>
        <Alert variant="warning">
          <div style={{ marginBottom: 16 }}>{label}</div>
          <Form.Checkbox
            isInline
            checked={allowFull}
            label="Yes, display all the tracks"
            // name="allow-full-inline-checkboxes"
            value="allowFull"
            onChange={(e) => {
              const {
                target: { value, checked },
              } = e;
              onChange(value, checked);
            }}
          />
        </Alert>
      </div>
    );
  }
  return null;
};

FullEpiBrowserToggler.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  allowFull: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

class FormElements extends Component {
  componentDidMount() {
    const {
      query: { selected: selectedEntries },
      history,
    } = this.props;
    if (!selectedEntries || selectedEntries.length === 0) history.push('/');

    const { dispatchResetBrowserEntries } = this.props;

    const selNum = (selectedEntries || []).length;
    if (selNum > 3) {
      console.log(`Too many selected entries: ${selNum}`);
    }

    const defaultAssembly = 'hg38';
    // Update the fragment series right after reset the browser
    const { dispatchFetchFragmentSizeSeries } = this.props;
    const callback = (browserState) => {
      const { fragSizeSeries = [] } = browserState;
      dispatchFetchFragmentSizeSeries(fragSizeSeries);
    };
    dispatchResetBrowserEntries(
      defaultAssembly,
      // selectedEntries.slice(0, 3),
      selectedEntries,
      callback
    );
  }

  updateFormValue = (event) => {
    const assembly = event.target.value;
    log.info(`Change to assembly: ${assembly}`);

    // const { dispatchChangeAssembly } = this.props;
    // dispatchChangeAssembly(assembly);
    const { dispatchResetBrowserEntries, entries } = this.props;
    // Update the fragment series right after reset the browser
    const { dispatchFetchFragmentSizeSeries } = this.props;
    const callback = (browserState) => {
      const { fragSizeSeries = [] } = browserState;
      dispatchFetchFragmentSizeSeries(fragSizeSeries);
    };
    dispatchResetBrowserEntries(assembly, entries, callback);
  };

  updateAllowFull = (value, checked) => {
    const {
      allowFull,
      dispatchToggleAllowFullTracks,
      dispatchResetBrowserEntries,
      assembly,
      entries,
    } = this.props;
    if (allowFull !== checked) {
      dispatchToggleAllowFullTracks(checked);
      dispatchResetBrowserEntries(assembly, entries);
    }
  };

  shouldComponentUpdate = (nextProps) => {
    const {
      assembly,
      allowFull,
      entries,
      fragSizeSeries,
      downloads: { downloadList },
    } = this.props;
    const {
      assembly: nextAssembly,
      allowFull: nextAllowFull,
      entries: nextEntries,
      fragSizeSeries: nextFragSizeSeries,
      downloads: { downloadList: nextDownloadList },
    } = nextProps;

    const shouldUpdate =
      assembly !== nextAssembly ||
      allowFull !== nextAllowFull ||
      downloadList !== nextDownloadList ||
      JSON.stringify(entries.map((entry) => entry.id).sort()) !==
        JSON.stringify(nextEntries.map((entry) => entry.id).sort()) ||
      JSON.stringify(
        fragSizeSeries
          .filter((item) => item.dataPts)
          .map((item) => item.key)
          .sort()
      ) !==
        JSON.stringify(
          nextFragSizeSeries
            .filter((item) => item.dataPts)
            .map((item) => item.key)
            .sort()
        );
    return shouldUpdate;
  };

  handleAddDownloadItem = (entries, isAdding) => {
    const { dispatchAddDownloadItems } = this.props;
    dispatchAddDownloadItems(entries, isAdding);
  };

  render() {
    console.log('VisualizationPage render');

    const { fragSizeSeries = [], downloads } = this.props;

    const samples = [];
    const {
      entries,
      tracks,
      allowFull,
      displayedEntryIds,
      assembly,
      // dispatchSetFragSize,
    } = this.props;
    const displayedEntries = (entries || []).filter(({ id: entryId }) =>
      displayedEntryIds.includes(entryId)
    );

    if (!samples) return null;

    return (
      <SiteWrapper>
        <Page.Content>
          <Grid.Row cards>
            <Grid.Col>
              <Card>
                <Table className="card-table table-vcenter">
                  <Table.Body>
                    <Table.Row>
                      <Table.Col>
                        <Form.Group label="Human Reference Genome (choose one)">
                          <Form.SelectGroup>
                            <Form.SelectGroupItem
                              name="genomeAssembly"
                              label="hg19 (GRCh37)"
                              value="hg19"
                              checked={assembly === 'hg19'}
                              // checked={form.genomeAssembly['hg19']}
                              onChange={this.updateFormValue}
                            />
                            <Form.SelectGroupItem
                              name="genomeAssembly"
                              label="hg38 (GRCh38)"
                              value="hg38"
                              checked={assembly === 'hg38'}
                              // checked={form.genomeAssembly['hg38']}
                              onChange={this.updateFormValue}
                            />
                          </Form.SelectGroup>
                        </Form.Group>
                      </Table.Col>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Card>
            </Grid.Col>

            <Grid.Col>
              <Card>
                <Table
                  responsive
                  highlightRowOnHover
                  hasOutline
                  cards
                  className="text-nowrap"
                >
                  <SamplesTable
                    entries={displayedEntries}
                    downloads={downloads}
                    handleAddDownloadItem={this.handleAddDownloadItem}
                  />
                </Table>
              </Card>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row>
            <Grid.Col>
              <Card>
                <Charts series={fragSizeSeries} />
              </Card>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row>
            <Grid.Col width={5}>
              <EpiBrowserSessionUploader />
            </Grid.Col>
          </Grid.Row>

          <Grid.Row>
            <Grid.Col width={12}>
              <FullEpiBrowserToggler
                tracks={tracks}
                allowFull={allowFull}
                onChange={this.updateAllowFull}
              />
            </Grid.Col>
          </Grid.Row>

          <Grid.Row>
            <Grid.Col>
              <Card>
                <EpiBrowser />
              </Card>
            </Grid.Col>
          </Grid.Row>
        </Page.Content>
      </SiteWrapper>
    );
  }
}

FormElements.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object.isRequired,
  fragSizeSeries: PropTypes.arrayOf(
    PropTypes.shape({
      dataPts: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
      dataUrl: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  tracks: PropTypes.arrayOf(PropTypes.shape()),
  allowFull: PropTypes.bool,
  assembly: PropTypes.string.isRequired,
  entries: PropTypes.arrayOf(PropTypes.shape()),

  query: PropTypes.shape({
    selected: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })),
  }).isRequired,

  displayedEntryIds: PropTypes.arrayOf(PropTypes.string),
  dispatchResetBrowserEntries: PropTypes.func.isRequired,
  dispatchFetchFragmentSizeSeries: PropTypes.func.isRequired,
  dispatchToggleAllowFullTracks: PropTypes.func.isRequired,
  // dispatchSetDisplayRegion: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};

FormElements.defaultProps = {
  fragSizeSeries: [],
  tracks: [],
  allowFull: false,
  displayedEntryIds: [],
  entries: [],
};

const mapDispatchToProps = (dispatch) => ({
  dispatchSetDisplayRegion: (region) => dispatch(setDisplayRegion(region)),
  dispatchToggleAllowFullTracks: (allowFull) =>
    dispatch(toggleAllowFullTracks(allowFull)),
  dispatchResetBrowserEntries: (assembly, entries, callback) =>
    dispatch(resetBrowserEntries(assembly, entries, callback)),
  dispatchFetchFragmentSizeSeries: (fragSizeSeries) =>
    dispatch(fetchFragmentSizeSeries(fragSizeSeries)),
  dispatchAddDownloadItems: (entries, isAdding) =>
    dispatch(addDownloadItems(entries, isAdding)),
});

const mapStateToProps = (state) => {
  // const { entries } = state.browser;
  return {
    ...state.browser,
    query: {
      selected: state.query.selectedSeqruns,
    },
    downloads: state.downloads,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FormElements);
