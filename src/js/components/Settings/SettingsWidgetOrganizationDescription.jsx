import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import { prepareForCordovaKeyboard, restoreStylesAfterCordovaKeyboard } from '../../utils/cordovaUtils';
import { isSpeakerTypeOrganization } from '../../utils/organization-functions';
import LoadingWheel from '../LoadingWheel';
import { renderLog } from '../../utils/logging';
import OrganizationActions from '../../actions/OrganizationActions';
import OrganizationStore from '../../stores/OrganizationStore';
import VoterStore from '../../stores/VoterStore';

const delayBeforeApiUpdateCall = 1200;
const delayBeforeRemovingSavedStatus = 4000;

export default class SettingsWidgetOrganizationDescription extends Component {
  static propTypes = {
    voterHasMadeChangesFunction: PropTypes.func,
  };

  constructor (props) {
    super(props);
    this.state = {
      isOrganization: false,
      linkedOrganizationWeVoteId: '',
      organizationDescriptionSavedStatus: '',
      organizationDescription: '',
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.updateOrganizationDescription = this.updateOrganizationDescription.bind(this);
  }

  componentWillMount () {
    prepareForCordovaKeyboard(__filename);
  }

  componentDidMount () {
    this.onVoterStoreChange();
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
  }

  componentWillUnmount () {
    this.organizationStoreListener.remove();
    this.voterStoreListener.remove();
    this.timer = null;
    this.clearStatusTimer = null;
    restoreStylesAfterCordovaKeyboard(__filename);
  }

  onOrganizationStoreChange () {
    const organization = OrganizationStore.getOrganizationByWeVoteId(this.state.linkedOrganizationWeVoteId);
    if (organization && organization.organization_we_vote_id) {
      this.setState({
        organizationDescription: organization.organization_description,
        isOrganization: isSpeakerTypeOrganization(organization.organization_type),
      });
    }
  }

  onVoterStoreChange () {
    if (VoterStore.isVoterFound()) {
      const voter = VoterStore.getVoter();
      this.setState({
        voter,
      });
      if (voter && voter.linked_organization_we_vote_id) {
        this.setState({
          linkedOrganizationWeVoteId: voter.linked_organization_we_vote_id,
        });
        if (voter.linked_organization_we_vote_id !== this.state.linkedOrganizationWeVoteId) {
          const organization = OrganizationStore.getOrganizationByWeVoteId(voter.linked_organization_we_vote_id);
          if (organization && organization.organization_we_vote_id) {
            this.setState({
              organizationDescription: organization.organization_description,
              isOrganization: isSpeakerTypeOrganization(organization.organization_type),
            });
          }
        }
      }
    }
  }

  handleKeyPress () {
    clearTimeout(this.timer);
    if (this.props.voterHasMadeChangesFunction) {
      this.props.voterHasMadeChangesFunction();
    }
    this.timer = setTimeout(() => {
      OrganizationActions.organizationDescriptionSave(this.state.linkedOrganizationWeVoteId, this.state.organizationDescription);
      this.setState({ organizationDescriptionSavedStatus: 'Saved' });
    }, delayBeforeApiUpdateCall);
  }

  updateOrganizationDescription (event) {
    if (event.target.name === 'organizationDescription') {
      this.setState({
        organizationDescription: event.target.value,
        organizationDescriptionSavedStatus: 'Saving description...',
      });
    }
    // After some time, clear saved message
    clearTimeout(this.clearStatusTimer);
    this.clearStatusTimer = setTimeout(() => {
      this.setState({ organizationDescriptionSavedStatus: '' });
    }, delayBeforeRemovingSavedStatus);
  }

  render () {
    renderLog(__filename);
    if (!this.state.voter) {
      return LoadingWheel;
    }

    return (
      <div className="">
        <form onSubmit={(e) => { e.preventDefault(); }}>
          <label htmlFor="organizationDescriptionTextArea">{ this.state.isOrganization ? 'Description Shown on Your Voter Guides' : 'Description Shown on Your Voter Guides'}</label>
          <Textarea
            id="organizationDescriptionTextArea"
            name="organizationDescription"
            className="form-control"
            minRows={2}
            placeholder={this.state.isOrganization ? 'Organization Description' : 'Description of You'}
            value={this.state.organizationDescription}
            onKeyDown={this.handleKeyPress}
            onChange={this.updateOrganizationDescription}
          />
        </form>
        <div className="u-gray-mid">{this.state.organizationDescriptionSavedStatus}</div>
      </div>
    );
  }
}
