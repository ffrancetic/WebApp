import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CandidateStore from '../../stores/CandidateStore';
import ItemActionBar from './ItemActionBar';
import ItemPositionStatementActionBar from './ItemPositionStatementActionBar';
import { renderLog } from '../../utils/logging';
import MeasureStore from '../../stores/MeasureStore';
import SupportStore from '../../stores/SupportStore';
import { stringContains } from '../../utils/textFormat';

// December 2018:  We want to work toward being airbnb style compliant, but for now these are disabled in this file to minimize complex changes
/* eslint react/no-find-dom-node: 1 */
/* eslint array-callback-return: 1 */

class BallotItemSupportOpposeComment extends PureComponent {
  static propTypes = {
    ballotItemWeVoteId: PropTypes.string,
    currentBallotIdInUrl: PropTypes.string,
    showPositionStatementActionBar: PropTypes.bool,
    urlWithoutHash: PropTypes.string,
  };

  constructor (props) {
    super(props);

    this.popover_state = {};

    this.state = {
      ballotItemDisplayName: '',
      ballotItemType: '',
      ballotItemWeVoteId: '',
      // componentDidMountFinished: false,
      showPositionStatement: false,
      shouldFocusCommentArea: false,
      ballotItemSupportProps: {},
    };
    this.passDataBetweenItemActionToItemPosition = this.passDataBetweenItemActionToItemPosition.bind(this);
    this.togglePositionStatement = this.togglePositionStatement.bind(this);
  }

  componentDidMount () {
    // console.log('BallotItemSupportOpposeComment, componentDidMount, this.props: ', this.props);
    this.candidateStoreListener = CandidateStore.addListener(this.onCandidateStoreChange.bind(this));
    this.measureStoreListener = MeasureStore.addListener(this.onMeasureStoreChange.bind(this));
    let ballotItemDisplayName = '';
    const ballotItemSupportProps = SupportStore.get(this.props.ballotItemWeVoteId);
    let ballotItemType;
    let isCandidate = false;
    let isMeasure = false;
    if (stringContains('cand', this.props.ballotItemWeVoteId)) {
      const candidate = CandidateStore.getCandidate(this.props.ballotItemWeVoteId);
      ballotItemDisplayName = candidate.ballot_item_display_name || '';
      ballotItemType = 'CANDIDATE';
      isCandidate = true;
    } else if (stringContains('meas', this.props.ballotItemWeVoteId)) {
      const measure = MeasureStore.getMeasure(this.props.ballotItemWeVoteId);
      ballotItemDisplayName = measure.ballot_item_display_name || '';
      ballotItemType = 'MEASURE';
      isMeasure = true;
    }
    this.setState({
      ballotItemDisplayName,
      ballotItemSupportProps,
      ballotItemType,
      ballotItemWeVoteId: this.props.ballotItemWeVoteId,
      // componentDidMountFinished: true,
      isCandidate,
      isMeasure,
      // voter: VoterStore.getVoter(), // We only set this once since the info we need isn't dynamic
    });
  }

  componentWillReceiveProps (nextProps) {
    // console.log('BallotItemSupportOpposeComment, componentWillReceiveProps');
    let ballotItemDisplayName = '';
    const ballotItemSupportProps = SupportStore.get(nextProps.ballotItemWeVoteId);
    let ballotItemType;
    let isCandidate = false;
    let isMeasure = false;
    if (stringContains('cand', nextProps.ballotItemWeVoteId)) {
      const candidate = CandidateStore.getCandidate(nextProps.ballotItemWeVoteId);
      ballotItemDisplayName = candidate.ballot_item_display_name || '';
      ballotItemType = 'CANDIDATE';
      isCandidate = true;
    } else if (stringContains('meas', nextProps.ballotItemWeVoteId)) {
      const measure = MeasureStore.getMeasure(nextProps.ballotItemWeVoteId);
      ballotItemDisplayName = measure.ballot_item_display_name || '';
      ballotItemType = 'MEASURE';
      isMeasure = true;
    }
    this.setState({
      ballotItemDisplayName,
      ballotItemSupportProps,
      ballotItemType,
      ballotItemWeVoteId: nextProps.ballotItemWeVoteId,
      isCandidate,
      isMeasure,
    });
  }

  componentWillUnmount () {
    this.candidateStoreListener.remove();
    this.measureStoreListener.remove();
  }

  // See https://reactjs.org/docs/error-boundaries.html
  static getDerivedStateFromError (error) {       // eslint-disable-line no-unused-vars
    // Update state so the next render will show the fallback UI, We should have a "Oh snap" page
    return { hasError: true };
  }

  onCandidateStoreChange () {
    if (this.state.isCandidate) {
      const { ballotItemWeVoteId } = this.state;
      const candidate = CandidateStore.getCandidate(ballotItemWeVoteId);
      const ballotItemDisplayName = candidate.ballot_item_display_name || '';
      this.setState({
        ballotItemDisplayName,
      });
    }
  }

  onMeasureStoreChange () {
    if (this.state.isMeasure) {
      const { ballotItemWeVoteId } = this.state;
      const measure = MeasureStore.getMeasure(ballotItemWeVoteId);
      const ballotItemDisplayName = measure.ballot_item_display_name || '';
      this.setState({
        ballotItemDisplayName,
      });
    }
  }

  componentDidCatch (error, info) {
    // We should get this information to Splunk!
    console.error('BallotItemSupportOpposeComment caught error: ', `${error} with info: `, info);
  }

  passDataBetweenItemActionToItemPosition () {
    this.setState(() => ({ shouldFocusCommentArea: true }));
  }

  togglePositionStatement () {
    this.setState(state => ({
      showPositionStatement: !state.showPositionStatement,
      shouldFocusCommentArea: true,
    }));
  }

  render () {
    // console.log('BallotItemSupportOpposeComment render, this.state.ballotItemWeVoteId:', this.state.ballotItemWeVoteId);
    if (!this.state.ballotItemWeVoteId) return null;
    renderLog(__filename);
    const { showPositionStatementActionBar } = this.props;
    // Voter Support or opposition
    const { is_voter_support: isVoterSupport, is_voter_oppose: isVoterOppose, voter_statement_text: voterStatementText } = this.state.ballotItemSupportProps || {};

    let commentBoxIsVisible = false;
    if (showPositionStatementActionBar || isVoterSupport || isVoterOppose || voterStatementText || this.state.showPositionStatement) {
      commentBoxIsVisible = true;
    }
    const itemActionBar = (
      <ItemActionBar
        ballot_item_display_name={this.state.ballotItemDisplayName}
        ballotItemWeVoteId={this.state.ballotItemWeVoteId}
        commentButtonHide={commentBoxIsVisible}
        commentButtonHideInMobile
        currentBallotIdInUrl={this.props.currentBallotIdInUrl}
        shareButtonHide
        supportOrOpposeHasBeenClicked={this.passDataBetweenItemActionToItemPosition}
        toggleFunction={this.togglePositionStatement}
        transitioning={this.state.transitioning}
        type={this.state.ballotItemType}
        urlWithoutHash={this.props.urlWithoutHash}
      />
    );

    const commentDisplayDesktop = showPositionStatementActionBar || isVoterSupport || isVoterOppose || voterStatementText || this.state.showPositionStatement ? (
      <div className="d-none d-sm-block u-min-50 u-stack--sm u-push--xs">
        <ItemPositionStatementActionBar
          ballot_item_we_vote_id={this.state.ballotItemWeVoteId}
          ballotItemDisplayName={this.state.ballotItemDisplayName}
          comment_edit_mode_on={this.state.showPositionStatement}
          supportProps={this.state.ballotItemSupportProps}
          shouldFocus={this.state.shouldFocusCommentArea}
          transitioning={this.state.transitioning}
          type={this.state.ballotItemType}
          shown_in_list
        />
      </div>
    ) :
      null;

    const commentDisplayMobile = showPositionStatementActionBar || isVoterSupport || isVoterOppose || voterStatementText ? (
      <div className="d-block d-sm-none u-min-50 u-push--xs">
        <ItemPositionStatementActionBar
          ballot_item_we_vote_id={this.state.ballotItemWeVoteId}
          ballotItemDisplayName={this.state.ballotItemDisplayName}
          supportProps={this.state.ballotItemSupportProps}
          shouldFocus={this.state.shouldFocusCommentArea}
          transitioning={this.state.transitioning}
          type={this.state.ballotItemType}
          shown_in_list
          mobile
        />
      </div>
    ) :
      null;

    return (
      <Wrapper showPositionStatementActionBar={showPositionStatementActionBar}>
        <BallotHeaderDivider className="u-show-mobile" />
        <ActionBar>
          {/* Support/Oppose/Comment toggle here */}
          {itemActionBar}
        </ActionBar>
        { commentDisplayDesktop }
        { commentDisplayMobile }
      </Wrapper>
    );
  }
}

const Wrapper = styled.div`
  width: 100%;
  background-color: ${({ showPositionStatementActionBar }) => (showPositionStatementActionBar ? '#F5F5F5' : 'white')};
  padding: 16px;
  /* padding-left: 0; */
  border-radius: 4px;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    background-color: white;
    padding: 0;
  }
`;

const ActionBar = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const BallotHeaderDivider = styled.div`
  margin: 8px 0;
  width: 100%;
  background: #f7f7f7;
  height: 2px;
`;


export default BallotItemSupportOpposeComment;
