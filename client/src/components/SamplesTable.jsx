import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Text, Form, Dropdown } from 'tabler-react';
import { connect } from 'react-redux';
import { addDownload, removeDownload } from '../redux/downloads/actions';
import { Link } from 'react-router-dom';

const SamplesTableRow = ({
  downloads,
  // sample,
  entry,
  addDownload,
  removeDownload,
}) => {
  const { sample } = entry;
  const sampleInBasket = downloads.find(
    (download) => download.sraId === sample.sraId
  );
  const addToBasket = () => addDownload(sample);
  const removeFromBasket = () => removeDownload(sample.sraId);

  // const disease = sample.disease || '';
  const disease = (entry.sample || {}).disease || '';
  // (sample.pathological || []).join(', ');
  const truncatedDisease =
    disease.length > 20 ? `${disease.substring(0, 20)}  ...` : disease;

  return (
    <Table.Row>
      <Table.Col>
        <div>{sample.name}</div>
        <Text size="sm" muted>
          {entry.originalId || entry.sraId}
        </Text>
      </Table.Col>
      <Table.Col>
        <div title={disease}>{truncatedDisease}</div>
        <Text size="sm" muted>
          {sample.gender || ''}
          {sample.age || ''}
        </Text>
      </Table.Col>
      <Table.Col>{sample.tissue || ''}</Table.Col>
      <Table.Col>
        <Text size="sm" muted>
          {(entry.seqConfig || {}).readlen || ''} <br />
          {entry.mbases || ''}
        </Text>
      </Table.Col>
      <Table.Col>
        <Text size="sm" muted>
          PAIRED
        </Text>
      </Table.Col>
      <Table.Col>
        <Text size="sm" muted>
          {entry.assay}
        </Text>
      </Table.Col>
      {/* <Table.Col>
        <Text size="sm" muted>
          {sample.platform}
        </Text>
      </Table.Col> */}

      {/* <Table.Col alignContent="center">
        <Form.Group>
          <Form.InputGroup append>
            <Button.Dropdown>
              <Dropdown.Item>
                <Button
                  link
                  onClick={sampleInBasket ? removeFromBasket : addToBasket}
                >
                  Direct Download
                </Button>
              </Dropdown.Item>
              <Dropdown.Item>
                <Button
                  link
                  onClick={sampleInBasket ? removeFromBasket : addToBasket}
                >
                  Add to download list
                </Button>
              </Dropdown.Item>
              <Dropdown.ItemDivider />
              <Dropdown.Item>
                <Link to={`/visualization/${sample.sraId}`}>
                  <Button link>Visualization</Button>
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Button link RootComponent="a" href={sample.publication.link}>
                  See Publication
                </Button>
              </Dropdown.Item>
            </Button.Dropdown>
          </Form.InputGroup>
        </Form.Group>
      </Table.Col> */}
    </Table.Row>
  );
};

const mapStateToProps = (state) => ({
  downloads: state.downloads.downloads,
});

const SamplesTableRowConnected = connect(mapStateToProps, {
  addDownload,
  removeDownload,
})(SamplesTableRow);

const SamplesTable = ({ entries }) => {
  const header = (
    <Table.Header>
      <Table.Row>
        <Table.ColHeader>
          Sample Name
          <br /> Run ID
        </Table.ColHeader>
        <Table.ColHeader>
          Disease status <br /> Sex, Age
        </Table.ColHeader>
        <Table.ColHeader>Tissue</Table.ColHeader>
        <Table.ColHeader>
          Read length <br /> Mbases{' '}
        </Table.ColHeader>
        <Table.ColHeader>Library Layout</Table.ColHeader>
        <Table.ColHeader>Assay</Table.ColHeader>
        {/* <Table.ColHeader>Platform</Table.ColHeader> */}

        {/* <Table.ColHeader>Other</Table.ColHeader> */}
      </Table.Row>
    </Table.Header>
  );

  const content = Object.values(entries).map((entry) => {
    return (
      <SamplesTableRowConnected
        key={entry.id}
        entry={entry}
        sample={entry.sample}
      />
    );
  });

  return (
    <div>
      {header}
      <Table.Body>{content}</Table.Body>
    </div>
  );
};

SamplesTable.propTypes = {
  entries: PropTypes.shape(),
  sampleInfoMap: PropTypes.shape(),
};

SamplesTable.defaultProps = {
  entries: {},
};

export default SamplesTable;
