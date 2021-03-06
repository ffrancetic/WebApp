import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Avatar from '@material-ui/core/Avatar/index';
import BallotItemSupportOpposeCountDisplay from '../Widgets/BallotItemSupportOpposeCountDisplay';
import { isCordova } from '../../utils/cordovaUtils';
import ImageHandler from '../ImageHandler';
import { renderLog } from '../../utils/logging';
import VoterGuideStore from '../../stores/VoterGuideStore';
import SupportStore from '../../stores/SupportStore';
import { toTitleCase } from '../../utils/textFormat';


class OfficeItemReadyToVote extends Component {
  static propTypes = {
    candidateList: PropTypes.array,
  };

  constructor (props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount () {
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    this.onVoterGuideStoreChange();
    this.supportStoreListener = SupportStore.addListener(this.onSupportStoreChange.bind(this));
    // console.log("OfficeItemCompressed, this.props.we_vote_id: ", this.props.we_vote_id);
  }

  componentWillUnmount () {
    this.voterGuideStoreListener.remove();
    this.supportStoreListener.remove();
  }

  onVoterGuideStoreChange () {
    // We just want to trigger a re-render
    this.setState();
  }

  onSupportStoreChange () {
    // We just want to trigger a re-render
    this.setState();
  }

  render () {
    renderLog(__filename);
    const isSupportArray = [];
    let supportProps;
    let isSupport;

    // ballotItemDisplayName = capitalizeString(ballotItemDisplayName);

    this.props.candidateList.forEach((candidate) => {
      supportProps = SupportStore.get(candidate.we_vote_id);
      if (supportProps) {
        isSupport = supportProps.is_support;

        if (isSupport) {
          isSupportArray.push(candidate.ballot_item_display_name);
        }
      }
    });

    /* This function finds the highest support count for each office but does not handle ties. If two candidates have the
    same network support count, only the first candidate will be displayed. */
    let largestSupportCount = 0;

    if (isSupportArray.length === 0) {
      let networkSupportCount;
      let networkOpposeCount;

      this.props.candidateList.forEach((candidate) => {
        supportProps = SupportStore.get(candidate.we_vote_id);
        if (supportProps) {
          networkSupportCount = supportProps.support_count;
          networkOpposeCount = supportProps.oppose_count;

          if (networkSupportCount > networkOpposeCount) {
            if (networkSupportCount > largestSupportCount) {
              largestSupportCount = networkSupportCount;
            }
          }
        }
      });
    }
    let candidatePhotoUrl;
    return (
      <React.Fragment>
        <Wrapper>
          { this.props.candidateList.map((oneCandidate) => {
            candidatePhotoUrl = '';
            if (oneCandidate.candidate_photo_url_medium) {
              candidatePhotoUrl = oneCandidate.candidate_photo_url_medium;
            } else if (oneCandidate.candidate_photo_url_large) {
              candidatePhotoUrl = oneCandidate.candidate_photo_url_large;
            }
            const candidatePhotoUrlHtml = (
              <ImageHandler
                className="card-main__avatar"
                sizeClassName="icon-office-child "
                imageUrl={candidatePhotoUrl}
                alt="candidate-photo"
                kind_of_ballot_item="CANDIDATE"
              />
            );
            return (
              <React.Fragment key={oneCandidate.we_vote_id}>
                { SupportStore.get(oneCandidate.we_vote_id) && SupportStore.get(oneCandidate.we_vote_id).is_support && (  // eslint-disable-line no-nested-ternary
                  <InnerWrapper>
                    <BioColumn>
                      {isCordova() ? candidatePhotoUrlHtml : <Avatar src={candidatePhotoUrl} /> }
                      <BioInformation>
                        <NameText>{oneCandidate.ballot_item_display_name}</NameText>
                        <DesktopTabletView>
                          <DescriptionText>{toTitleCase(oneCandidate.party)}</DescriptionText>
                        </DesktopTabletView>
                        <MobileView>
                          <DescriptionText>{oneCandidate.contest_office_name}</DescriptionText>
                        </MobileView>
                      </BioInformation>
                    </BioColumn>
                    <OfficeColumn>
                      <DesktopTabletView>
                        <OfficeText>{oneCandidate.contest_office_name}</OfficeText>
                      </DesktopTabletView>
                      <BallotItemSupportOpposeCountDisplay ballotItemWeVoteId={oneCandidate.we_vote_id} />
                    </OfficeColumn>
                  </InnerWrapper>
                )
                }
              </React.Fragment>
            );
          })
          }
        </Wrapper>
        <HR />
      </React.Fragment>
    );
  }
}

const Wrapper = styled.div`
  padding: 24px 24px 20px 24px;
  transition: all 200ms ease-in;
  border: 1px solid transparent;
  border-radius: 4px;
`;

const InnerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  width: 100%;
`;

const BioColumn = styled.div`
  display: flex;
`;

const OfficeColumn = styled.div`
  display: flex;
`;

const OfficeText = styled.p`
  font-weight: 500;
  margin: auto 0;
  margin-right: 16px;
`;

const BioInformation = styled.div`
  display: flex;
  flex-flow: column;
  margin-left: 8px;
`;

const NameText = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  @media print{
    font-size: 1.5rem;
  }
`;

const DescriptionText = styled.p`
  font-size: 12px;
  margin: 0;
  @media print {
    font-size: 1.5rem;
  } 
`;

const HR = styled.hr`
  margin: 0 24px;
`;

const DesktopTabletView = styled.div`
  display: inherit;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none;
  }
`;

const MobileView = styled.div`
  display: inherit;
  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none;
  }
`;

export default OfficeItemReadyToVote;
