import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import AppStore from '../../stores/AppStore';
import AppActions from '../../actions/AppActions';
import CandidateStore from '../../stores/CandidateStore';
import cookies from '../../utils/cookies';
import { isCordova, isWebApp } from '../../utils/cordovaUtils';
import HeaderBarProfilePopUp from './HeaderBarProfilePopUp';
import OrganizationActions from '../../actions/OrganizationActions';
import OrganizationStore from '../../stores/OrganizationStore';
import { renderLog } from '../../utils/logging';
import VoterGuideActions from '../../actions/VoterGuideActions';
import VoterSessionActions from '../../actions/VoterSessionActions';
import { stringContains } from '../../utils/textFormat';
import OfficeStore from '../../stores/OfficeStore';
import OfficeItem from '../Ballot/OfficeItem';
import HeaderBackToButton from './HeaderBackToButton';
import SignInModal from '../Widgets/SignInModal';

class HeaderBackToBallot extends Component {
  static propTypes = {
    location: PropTypes.object,
    params: PropTypes.object.isRequired,
    pathname: PropTypes.string,
    voter: PropTypes.object,
    classes: PropTypes.object,
  };

  constructor (props) {
    super(props);
    this.state = {
      profilePopUpOpen: false,
      candidateWeVoteId: '',
      officeName: '',
      officeWeVoteId: '',
      organization: {},
      organizationWeVoteId: '',
      showSignInModal: AppStore.showSignInModal(),
      scrolledDown: AppStore.getScrolledDown(),
      voter: {},
    };
    this.toggleAccountMenu = this.toggleAccountMenu.bind(this);
    this.hideAccountMenu = this.hideAccountMenu.bind(this);
    this.hideProfilePopUp = this.hideProfilePopUp.bind(this);
    this.signOutAndHideProfilePopUp = this.signOutAndHideProfilePopUp.bind(this);
    this.toggleProfilePopUp = this.toggleProfilePopUp.bind(this);
    this.toggleSignInModal = this.toggleSignInModal.bind(this);
    this.transitionToYourVoterGuide = this.transitionToYourVoterGuide.bind(this);
  }

  componentDidMount () {
    // console.log('HeaderBackToBallot componentDidMount, this.props: ', this.props);
    this.appStoreListener = AppStore.addListener(this.onAppStoreChange.bind(this));
    this.candidateStoreListener = CandidateStore.addListener(this.onCandidateStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.officeStoreListener = OfficeStore.addListener(this.onOfficeStoreChange.bind(this));

    let candidateWeVoteId;
    let officeWeVoteId;
    let officeName;
    let organization = {};
    let organizationWeVoteId;
    if (this.props.params) {
      candidateWeVoteId = this.props.params.candidate_we_vote_id || '';
      officeWeVoteId = this.props.params.office_we_vote_id || '';
      if (candidateWeVoteId && candidateWeVoteId !== '') {
        const candidate = CandidateStore.getCandidate(candidateWeVoteId);

        // console.log('HeaderBackToBallot, candidateWeVoteId:', candidateWeVoteId, ', candidate:', candidate);
        officeWeVoteId = candidate.contest_officeWeVoteId;
        officeName = candidate.contest_office_name;
      } else if (officeWeVoteId && officeWeVoteId !== '') {
        const office = OfficeStore.getOffice(officeWeVoteId);
        officeName = office ? office.ballot_item_display_name : '';
      }

      organizationWeVoteId = this.props.params.organization_we_vote_id || '';
      organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      if (organizationWeVoteId && organizationWeVoteId !== '' && !organization.organization_we_vote_id) {
        // Retrieve the organization object
        OrganizationActions.organizationRetrieve(organizationWeVoteId);
      }
    }

    // console.log('candidateWeVoteId: ', candidateWeVoteId);
    // console.log('organizationWeVoteId: ', organizationWeVoteId);

    const weVoteBrandingOffFromUrl = this.props.location.query ? this.props.location.query.we_vote_branding_off : 0;
    const weVoteBrandingOffFromCookie = cookies.getItem('we_vote_branding_off');
    this.setState({
      candidateWeVoteId,
      officeName,
      officeWeVoteId,
      organization,
      organizationWeVoteId,
      voter: this.props.voter,
      we_vote_branding_off: weVoteBrandingOffFromUrl || weVoteBrandingOffFromCookie,
    });
  }

  componentWillReceiveProps (nextProps) {
    // console.log('HeaderBackToBallot componentWillReceiveProps, nextProps: ', nextProps);
    let candidateWeVoteId;
    let officeWeVoteId;
    let officeName;
    let organization = {};
    let organizationWeVoteId;
    if (nextProps.params) {
      candidateWeVoteId = nextProps.params.candidate_we_vote_id || '';
      officeWeVoteId = nextProps.params.office_we_vote_id || '';
      if (candidateWeVoteId && candidateWeVoteId !== '') {
        const candidate = CandidateStore.getCandidate(candidateWeVoteId);
        // console.log('HeaderBackToBallot, candidateWeVoteId:', candidateWeVoteId, ', candidate:', candidate);
        officeWeVoteId = candidate.contest_office_we_vote_id;
        officeName = candidate.contest_office_name;
      } else if (officeWeVoteId && officeWeVoteId !== '') {
        candidateWeVoteId = '';
        const office = OfficeStore.getOffice(officeWeVoteId);
        officeName = office ? office.ballot_item_display_name : '';
      }

      organizationWeVoteId = nextProps.params.organization_we_vote_id || '';
      organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      if (organizationWeVoteId && organizationWeVoteId !== '' && !organization.organization_we_vote_id) {
        // Retrieve the organization object
        OrganizationActions.organizationRetrieve(organizationWeVoteId);
      }
    }

    // console.log('candidateWeVoteId: ', candidateWeVoteId);
    // console.log('organizationWeVoteId: ', organizationWeVoteId);

    const weVoteBrandingOffFromUrl = nextProps.location.query ? nextProps.location.query.we_vote_branding_off : 0;
    const weVoteBrandingOffFromCookie = cookies.getItem('we_vote_branding_off');
    this.setState({
      candidateWeVoteId,
      officeName,
      officeWeVoteId,
      organization,
      organizationWeVoteId,
      voter: nextProps.voter,
      we_vote_branding_off: weVoteBrandingOffFromUrl || weVoteBrandingOffFromCookie,
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
    // This lifecycle method tells the component to NOT render if not needed
    if (this.state.candidateWeVoteId !== nextState.candidateWeVoteId) {
      // console.log('this.state.candidateWeVoteId: ', this.state.candidateWeVoteId, ', nextState.candidateWeVoteId', nextState.candidateWeVoteId);
      return true;
    }
    if (this.state.officeName !== nextState.officeName) {
      // console.log('this.state.officeName: ', this.state.officeName, ', nextState.officeName', nextState.officeName);
      return true;
    }
    if (this.state.officeWeVoteId !== nextState.officeWeVoteId) {
      // console.log('this.state.officeWeVoteId: ', this.state.officeWeVoteId, ', nextState.officeWeVoteId', nextState.officeWeVoteId);
      return true;
    }
    if (this.state.organizationWeVoteId !== nextState.organizationWeVoteId) {
      // console.log('this.state.organizationWeVoteId: ', this.state.organizationWeVoteId, ', nextState.organizationWeVoteId', nextState.organizationWeVoteId);
      return true;
    }
    if (this.state.profilePopUpOpen !== nextState.profilePopUpOpen) {
      // console.log('this.state.profilePopUpOpen: ', this.state.profilePopUpOpen, ', nextState.profilePopUpOpen', nextState.profilePopUpOpen);
      return true;
    }
    if (this.state.scrolledDown !== nextState.scrolledDown) {
      // console.log('this.state.scrolledDown: ', this.state.scrolledDown, ', nextState.scrolledDown', nextState.scrolledDown);
      return true;
    }
    if (this.state.showSignInModal !== nextState.showSignInModal) {
      // console.log('this.state.showSignInModal: ', this.state.showSignInModal, ', nextState.showSignInModal', nextState.showSignInModal);
      return true;
    }
    const { voter } = this.state;
    const { nextVoter } = nextState;
    let voterIsSignedIn = null;
    let voterPhotoUrlMedium = null;
    let nextVoterIsSignedIn = null;
    let nextVoterPhotoUrlMedium = null;
    if (voter) {
      voterIsSignedIn = voter.is_signed_in;
      voterPhotoUrlMedium = voter.voter_photo_url_medium;
    }
    if (nextVoter) {
      nextVoterIsSignedIn = nextVoter.is_signed_in;
      nextVoterPhotoUrlMedium = nextVoter.voter_photo_url_medium;
    }
    if (nextVoterIsSignedIn && voterIsSignedIn !== nextVoterIsSignedIn) {
      // console.log('voterIsSignedIn: ', voterIsSignedIn, ', nextVoterIsSignedIn: ', nextVoterIsSignedIn);
      return true;
    }
    if (nextVoterPhotoUrlMedium && voterPhotoUrlMedium !== nextVoterPhotoUrlMedium) {
      // console.log('voterPhotoUrlMedium: ', voterPhotoUrlMedium, ', nextVoterPhotoUrlMedium: ', nextVoterPhotoUrlMedium);
      return true;
    }
    return false;
  }

  componentWillUnmount () {
    // this.ballotStoreListener.remove();
    this.appStoreListener.remove();
    this.candidateStoreListener.remove();
    this.organizationStoreListener.remove();
    this.officeStoreListener.remove();
  }

  onAppStoreChange () {
    this.setState({
      scrolledDown: AppStore.getScrolledDown(),
      showSignInModal: AppStore.showSignInModal(),
    });
  }

  onCandidateStoreChange () {
    const { candidateWeVoteId } = this.state;
    // console.log('Candidate onCandidateStoreChange');
    let officeName;
    let officeWeVoteId;
    if (candidateWeVoteId && candidateWeVoteId !== '') {
      const candidate = CandidateStore.getCandidate(candidateWeVoteId);

      // console.log('HeaderBackToBallot -- onCandidateStoreChange, candidateWeVoteId:', this.state.candidateWeVoteId, ', candidate:', candidate);
      officeName = candidate.contest_office_name;
      officeWeVoteId = candidate.contest_office_we_vote_id;
    } else {
      officeWeVoteId = this.props.params.office_we_vote_id || '';
      if (officeWeVoteId && officeWeVoteId !== '') {
        const office = OfficeStore.getOffice(officeWeVoteId);
        officeName = office ? office.ballot_item_display_name : '';
      }
    }

    this.setState({
      candidate: CandidateStore.getCandidate(candidateWeVoteId),
      officeName,
      officeWeVoteId,
    });
  }

  onOrganizationStoreChange () {
    const { organizationWeVoteId } = this.state;
    this.setState({
      organization: OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId),
    });
  }

  onOfficeStoreChange () {
    const { officeWeVoteId } = this.state;
    let officeName;
    if (officeWeVoteId && officeWeVoteId !== '') {
      const office = OfficeStore.getOffice(officeWeVoteId);
      officeName = office ? office.ballot_item_display_name : '';
    }

    this.setState({
      officeName,
    });
  }

  getOfficeLink () {
    if (this.state.organizationWeVoteId && this.state.organizationWeVoteId !== '') {
      return `/office/${this.state.officeWeVoteId}/btvg/${this.state.organizationWeVoteId}`;
    } else {
      return `/office/${this.state.officeWeVoteId}/b/btdb/`; // back-to-default-ballot
    }
  }

  getVoterGuideLink () {
    const { organizationWeVoteId, candidate } = this.state;
    return `/voterguide/${organizationWeVoteId}/ballot/election/${candidate.google_civic_election_id}`;
  }

  signOutAndHideAccountMenu () {
    VoterSessionActions.voterSignOut();
    this.setState({ profilePopUpOpen: false });
  }

  transitionToYourVoterGuide () {
    // Positions for this organization, for this voter / election
    OrganizationActions.positionListForOpinionMaker(this.state.voter.linked_organization_we_vote_id, true);

    // Positions for this organization, NOT including for this voter / election
    OrganizationActions.positionListForOpinionMaker(this.state.voter.linked_organization_we_vote_id, false, true);
    OrganizationActions.organizationsFollowedRetrieve();
    VoterGuideActions.voterGuideFollowersRetrieve(this.state.voter.linked_organization_we_vote_id);
    VoterGuideActions.voterGuidesFollowedByOrganizationRetrieve(this.state.voter.linked_organization_we_vote_id);
    this.setState({ profilePopUpOpen: false });
  }

  hideAccountMenu () {
    this.setState({ profilePopUpOpen: false });
  }

  toggleAccountMenu () {
    const { profilePopUpOpen } = this.state;
    this.setState({ profilePopUpOpen: !profilePopUpOpen });
  }

  toggleProfilePopUp () {
    const { profilePopUpOpen } = this.state;
    this.setState({ profilePopUpOpen: !profilePopUpOpen });
  }

  closeSignInModal () {
    AppActions.setShowSignInModal(false);
  }

  toggleSignInModal () {
    const { showSignInModal } = this.state;
    AppActions.setShowSignInModal(!showSignInModal);
  }

  hideProfilePopUp () {
    this.setState({ profilePopUpOpen: false });
  }

  signOutAndHideProfilePopUp () {
    VoterSessionActions.voterSignOut();
    this.setState({ profilePopUpOpen: false });
  }

  render () {
    renderLog(__filename);
    const { organizationWeVoteId, candidate, voter, officeName, officeWeVoteId, scrolledDown } = this.state;
    const { classes, pathname } = this.props;
    const voterIsSignedIn = voter.is_signed_in;
    const voterPhotoUrlMedium = voter.voter_photo_url_medium;
    // console.log('HeaderBackToBallot render');

    let backToLink;
    if (organizationWeVoteId && candidate && candidate.google_civic_election_id) {
      backToLink = this.getVoterGuideLink(); // Default to this when there is an organizationWeVoteId
    } else if (candidate && candidate.google_civic_election_id) {
      backToLink = `/ballot/election/${candidate.google_civic_election_id}`;
    } else if (this.props.params.measure_we_vote_id) {
      backToLink = `/ballot#${this.props.params.measure_we_vote_id}`;
    } else {
      backToLink = '/ballot'; // Default to this
    }

    if (this.props.params.back_to_variable === 'bto' || this.props.params.back_to_variable === 'btdo') { // back-to-default-office
      backToLink = this.getOfficeLink();
    }

    let backToLinkText;
    if (organizationWeVoteId) {
      backToLinkText = 'Voter Guide'; // Back to
    } else {
      backToLinkText = 'Ballot'; // Back to
    }

    if (this.props.params.back_to_variable === 'bto' || this.props.params.back_to_variable === 'btdo') { // back-to-default-office
      if (this.state.officeName) {
        backToLinkText = `${this.state.officeName}`; // Back to
      } else {
        backToLinkText = 'Back';
      }
    } else if (this.state.organization && this.state.organization.organization_name) {
      backToLinkText = `${this.state.organization.organization_name}`; // Back to
    }

    const headerClassName = (function header () {
      let cname;
      if (stringContains('/office', pathname.toLowerCase())) {
        if (isWebApp()) {
          cname = 'page-header page-header__back-to-ballot';
        } else {
          cname = 'page-header page-header__back-to-ballot-cordova  page-header__cordova';
        }
      } else {
        cname = 'page-header';
      }
      return cname;
    }());

    let appBarClasses;
    const onCandidateOrMeasureRoute = stringContains('/candidate/', pathname.toLowerCase()) || stringContains('/measure/', pathname.toLowerCase());
    if (scrolledDown && onCandidateOrMeasureRoute) {
      appBarClasses = { root: classes.noBoxShadow };
    }

    return (
      <AppBar className={headerClassName} color="default" classes={appBarClasses}>
        <Toolbar className="header-toolbar header-backto-toolbar" disableGutters>
          <HeaderBackToButton
            backToLink={backToLink}
            backToLinkText={backToLinkText}
            id="backToLinkTabHeader"
          />

          {isWebApp() && (
          <div className="header-nav__avatar-wrapper u-cursor--pointer u-flex-none" onClick={this.toggleAccountMenu}>
            {voterIsSignedIn ? (
              <span>
                {voterPhotoUrlMedium ? (
                  <div
                    id="profileAvatarHeaderBar"
                    className={`header-nav__avatar-container ${isCordova() ? 'header-nav__avatar-cordova' : undefined}`}
                    onClick={this.toggleProfilePopUp}
                  >
                    <img
                      className="header-nav__avatar"
                      src={voterPhotoUrlMedium}
                      height={34}
                      width={34}
                      alt="Your Settings"
                    />
                  </div>
                ) : (
                  <div>
                    <IconButton
                      classes={{ root: classes.iconButtonRoot }}
                      id="profileAvatarHeaderBar"
                      onClick={this.toggleProfilePopUp}
                    >
                      <AccountCircleIcon />
                    </IconButton>
                  </div>
                )
                }
                {this.state.profilePopUpOpen && (
                <HeaderBarProfilePopUp
                  hideProfilePopUp={this.hideProfilePopUp}
                  onClick={this.toggleProfilePopUp}
                  profilePopUpOpen={this.state.profilePopUpOpen}
                  signOutAndHideProfilePopUp={this.signOutAndHideProfilePopUp}
                  toggleProfilePopUp={this.toggleProfilePopUp}
                  toggleSignInModal={this.toggleSignInModal}
                  transitionToYourVoterGuide={this.transitionToYourVoterGuide}
                  voter={this.props.voter}
                  weVoteBrandingOff={this.state.we_vote_branding_off}
                />
                )}
              </span>
            ) : (
              <Button
                className="header-sign-in"
                classes={{ root: classes.headerButtonRoot }}
                color="primary"
                id="signInHeaderBar"
                onClick={this.toggleSignInModal}
                variant="text"
              >
              Sign In
              </Button>
            )}
          </div>
          )}
        </Toolbar>
        {stringContains('/office', pathname.toLowerCase())  && officeName && (
          <OfficeItem
          weVoteId={officeWeVoteId}
          ballotItemDisplayName={officeName}
          />
        )}
        <SignInModal
          show={this.state.showSignInModal}
          toggleFunction={this.closeSignInModal}
        />
      </AppBar>
    );
  }
}

const styles = theme => ({
  noBoxShadow: {
    boxShadow: '0 0 0 0',
  },
  headerButtonRoot: {
    paddingTop: 2,
    paddingBottom: 2,
    '&:hover': {
      backgroundColor: 'transparent',
    },
    color: 'rgb(6, 95, 212)',
    marginLeft: '1rem',
    outline: 'none !important',
    [theme.breakpoints.down('md')]: {
      marginLeft: '.1rem',
    },
  },
});

export default withStyles(styles)(HeaderBackToBallot);
