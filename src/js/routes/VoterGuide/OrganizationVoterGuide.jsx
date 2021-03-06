import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Button from '@material-ui/core/Button';
import AnalyticsActions from '../../actions/AnalyticsActions';
import { historyPush } from '../../utils/cordovaUtils';
import FollowToggle from '../../components/Widgets/FollowToggle';
import VoterGuideStore from '../../stores/VoterGuideStore';
import LoadingWheel from '../../components/LoadingWheel';
import { renderLog } from '../../utils/logging';
import OrganizationActions from '../../actions/OrganizationActions';
import OrganizationCard from '../../components/VoterGuide/OrganizationCard';
import OrganizationStore from '../../stores/OrganizationStore';
import OrganizationVoterGuideCard from '../../components/VoterGuide/OrganizationVoterGuideCard';
import OrganizationVoterGuideTabs from '../../components/VoterGuide/OrganizationVoterGuideTabs';
import VoterStore from '../../stores/VoterStore';

const AUTO_FOLLOW = 'af';

export default class OrganizationVoterGuide extends Component {
  static propTypes = {
    active_route: PropTypes.string,
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  };

  constructor (props) {
    super(props);
    this.state = {
      active_route: '',
      organizationWeVoteId: '',
      organization: {},
      voter: {},
      autoFollowRedirectHappening: false,
    };
    this.organizationVoterGuideTabsReference = {};
    this.onEdit = this.onEdit.bind(this);
    this.ballotItemLinkHasBeenClicked = this.ballotItemLinkHasBeenClicked.bind(this);
  }

  componentDidMount () {
    // We can enter OrganizationVoterGuide with either organizationWeVoteId or voter_guide_we_vote_id
    // console.log("OrganizationVoterGuide, componentDidMount, this.props.params.organization_we_vote_id: ", this.props.params.organization_we_vote_id);
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
    if (this.props.params.organization_we_vote_id) {
      OrganizationActions.organizationRetrieve(this.props.params.organization_we_vote_id);
    }

    // positionListForOpinionMaker is called in js/components/VoterGuide/VoterGuidePositions
    // console.log("action_variable:" + this.props.params.action_variable);
    if (this.props.params.action_variable === AUTO_FOLLOW && this.props.params.organization_we_vote_id) {
      // If we are here,
      // console.log("Auto following");
      AnalyticsActions.saveActionVoterGuideAutoFollow(this.props.params.organization_we_vote_id, VoterStore.electionId());
      OrganizationActions.organizationFollow(this.props.params.organization_we_vote_id);

      // Now redirect to the same page without the "/af" in the route
      const currentPathName = this.props.location.pathname;

      // AUTO_FOLLOW is "af"
      const currentPathNameWithoutAutoFollow = currentPathName.replace(`/${AUTO_FOLLOW}`, '');

      // console.log("OrganizationVoterGuide, currentPathNameWithoutAutoFollow: ", currentPathNameWithoutAutoFollow);
      historyPush(currentPathNameWithoutAutoFollow);
      this.setState({
        autoFollowRedirectHappening: true,
      });
    } else {
      // console.log("VoterStore.getAddressObject(): ", VoterStore.getAddressObject());
      AnalyticsActions.saveActionVoterGuideVisit(this.props.params.organization_we_vote_id, VoterStore.electionId());
      this.setState({
        organizationWeVoteId: this.props.params.organization_we_vote_id,
        voter: VoterStore.getVoter(),
      });
    }

    // console.log("OrganizationVoterGuide, componentDidMount, this.props.active_route: ", this.props.active_route);
    this.setState({
      active_route: this.props.active_route,
    });
  }

  componentWillReceiveProps (nextProps) {
    // console.log("OrganizationVoterGuide, componentWillReceiveProps, nextProps.params.organization_we_vote_id: ", nextProps.params.organization_we_vote_id);
    // When a new organization is passed in, update this component to show the new data
    // if (nextProps.params.action_variable === AUTO_FOLLOW) {
    // Wait until we get the path without the "/af" action variable
    // console.log("OrganizationVoterGuide, componentWillReceiveProps - waiting");
    // } else

    if (nextProps.params.organization_we_vote_id && this.state.organizationWeVoteId !== nextProps.params.organization_we_vote_id) {
      // Only refresh data if we are working with a new organization
      // console.log("OrganizationVoterGuide, componentWillReceiveProps, nextProps.params: ", nextProps.params);
      this.setState({
        organizationWeVoteId: nextProps.params.organization_we_vote_id,
        autoFollowRedirectHappening: false,
      });

      // We refresh the data for all three tabs here on the top level
      OrganizationActions.organizationRetrieve(nextProps.params.organization_we_vote_id);

      // console.log("VoterStore.getAddressObject(): ", VoterStore.getAddressObject());
      AnalyticsActions.saveActionVoterGuideVisit(nextProps.params.organization_we_vote_id, VoterStore.electionId());

      // positionListForOpinionMaker is called in js/components/VoterGuide/VoterGuidePositions
    }
    // console.log("OrganizationVoterGuide, componentWillReceiveProps, nextProps.active_route: ", nextProps.active_route);
    if (nextProps.active_route && nextProps.active_route !== '') {
      this.setState({
        active_route: nextProps.active_route,
      });
    }
  }

  componentWillUnmount () {
    this.voterGuideStoreListener.remove();
    this.organizationStoreListener.remove();
    this.voterStoreListener.remove();
  }

  onEdit () {
    historyPush(`/voterguideedit/${this.state.organizationWeVoteId}`);
    return <div>{LoadingWheel}</div>;
  }

  onVoterGuideStoreChange () {
    const { organizationWeVoteId } = this.state;
    this.setState({
      organization: OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId),
    });
  }

  onOrganizationStoreChange () {
    const { organizationWeVoteId } = this.state;
    this.setState({
      organization: OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId),
    });
  }

  onVoterStoreChange () {
    this.setState({
      voter: VoterStore.getVoter(),
    });
  }

  ballotItemLinkHasBeenClicked (selectedBallotItemId) {
    if (this.organizationVoterGuideTabsReference &&
        this.organizationVoterGuideTabsReference.voterGuideBallotReference &&
        this.organizationVoterGuideTabsReference.voterGuideBallotReference.ballotItemsCompressedReference &&
        this.organizationVoterGuideTabsReference.voterGuideBallotReference.ballotItemsCompressedReference[selectedBallotItemId] &&
        this.organizationVoterGuideTabsReference.voterGuideBallotReference.ballotItemsCompressedReference[selectedBallotItemId].ballotItem) {
      this.organizationVoterGuideTabsReference.voterGuideBallotReference.ballotItemsCompressedReference[selectedBallotItemId].ballotItem.toggleExpandDetails(true);
    }
  }

  render () {
    renderLog(__filename);
    if (!this.state.organization || !this.state.voter || this.state.autoFollowRedirectHappening) {
      return <div>{LoadingWheel}</div>;
    }

    // console.log("OrganizationVoterGuide render, this.state.active_route: ", this.state.active_route);
    const organizationId = this.state.organization.organization_id;
    const isVoterOwner = this.state.organization.organization_we_vote_id !== undefined &&
      this.state.organization.organization_we_vote_id === this.state.voter.linked_organization_we_vote_id;

    if (!organizationId) {
      const floatRight = {
        float: 'right',
      };
      return (
        <div className="card">
          <div style={{ margin: 10 }}>
            <span style={floatRight}>
              <Link
                id="OrganizationVoterGuideGoToBallot"
                to="/ballot"
              >
                <Button
                  color="primary"
                  variant="contained"
                >
                  Go to Ballot &#x21AC;
                </Button>
              </Link>
            </span>
            <p>
              Find voter guides you can follow.
              These voter guides have been created by nonprofits, public figures, your friends, and more. (OrganizationVoterGuide)
            </p>
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Header Banner Spacing for Desktop */}
        <div className="col-md-12 d-none d-sm-block d-print-none">
          { this.state.organization.organization_banner_url !== '' ? (
            <div className="organization-banner-image-div d-print-none">
              <img className="organization-banner-image-img" src={this.state.organization.organization_banner_url} />
            </div>
          ) :
            <div className="organization-banner-image-non-twitter-users" />
          }
        </div>
        {/* Header Banner Spacing for Mobile */}
        <div className="d-block d-sm-none d-print-none">
          { this.state.organization.organization_banner_url !== '' ? (
            <div className="organization-banner-image-div d-print-none">
              <img className="organization-banner-image-img" src={this.state.organization.organization_banner_url} />
            </div>
          ) :
            <div className="organization-banner-image-non-twitter-users" />
          }
        </div>

        <div className="d-block d-sm-none">
          <div className="col-12">
            <div className="card">
              <div className="card-main">
                <OrganizationCard organization={this.state.organization} />
                { isVoterOwner ? (
                  <div className="u-float-right">
                    <Button
                      id="organizationVoterGuideEdit"
                      onClick={this.onEdit}
                      size="small"
                      variant="outlined"
                    >
                      <span>Edit</span>
                    </Button>
                  </div>
                ) :
                  <FollowToggle organizationWeVoteId={this.state.organization.organization_we_vote_id} showFollowingText />
                }
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid">
          <div className="row">
            <div className="d-none d-sm-block col-md-4">
              <div className="card">
                <div className="card-main">
                  <OrganizationVoterGuideCard organization={this.state.organization} is_voter_owner={isVoterOwner} />
                </div>
                <br />
              </div>
            </div>

            <div className="col-12 col-md-8">
              <OrganizationVoterGuideTabs
                organization={this.state.organization}
                location={this.props.location}
                params={this.props.params}
                active_route={this.state.active_route}
                ref={(ref) => { this.organizationVoterGuideTabsReference = ref; }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
