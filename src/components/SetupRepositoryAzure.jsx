import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";
export class SetupRepositoryAzure extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["container", "storageAccount"]);
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "Container", "container", {
            autoFocus: true,
            placeholder: "enter container name",
          })}
          {OptionalField(this, "Object Name Prefix", "prefix", {
            placeholder: "enter object name prefix or leave empty",
          })}
        </Row>
        <Row>
          {RequiredField(this, "Storage Account", "storageAccount", {
            placeholder: "enter storage account name",
          })}
          {OptionalField(this, "Access Key", "storageKey", {
            placeholder: "enter secret access key",
            type: "password",
          })}
        </Row>
        <Row>
          {OptionalField(this, "Azure Storage Domain", "storageDomain", {
            placeholder:
              "enter storage domain or leave empty for default 'blob.core.windows.net'",
          })}
          {OptionalField(this, "SAS Token", "sasToken", {
            placeholder: "enter secret SAS Token",
            type: "password",
          })}
        </Row>
      </>
    );
  }
}

SetupRepositoryAzure.propTypes = {
  initial: PropTypes.object,
};
