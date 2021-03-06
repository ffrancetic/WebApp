import React from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import CodeCopier from '../Widgets/CodeCopier';
import { cordovaScrollablePaneTopPadding } from '../../utils/cordovaOffsets';
import OpenExternalWebSite from '../Widgets/OpenExternalWebSite';

export default function ToolsToShareOnOtherWebsites () {
  return (
    <Wrapper padTop={cordovaScrollablePaneTopPadding()}>
      <Helmet title="Free civic engagement tools - We Vote" />
      <div className="container-fluid well">
        <h1 className="h1">Tools For Your Website</h1>

        <p>
          WeVote.US wants to give you our technology to use, for
          <strong> FREE</strong>
          , on your website.
        </p>

        <div className="u-show-desktop-tablet">
          <h2 className="h3">Why use WeVote.US tools?</h2>
          <ul>
            <li>All our of tools work in all 50 states and the District of Columbia.</li>
            <li>They’re fast and mobile-optimized, they’re free to use, and they’re the best tools available.</li>
          </ul>

          <h2 className="h3">Adding the tools to your website takes less than 2 minutes.</h2>
          <ol>
            <li>Copy the HTML code for the tool, or view the code.</li>
            <li>Paste the code on your website where you want the tool to appear.</li>
            <li>We recommend putting each tool on its own page so you don’t overwhelm your visitors.</li>
          </ol>
        </div>

        <div className="row">
          <CodeCopier
            title="Interactive Ballot Tool"
            sourceUrl="https://wevote.us/ballot"
            codeCopierButtonId="codeCopierInteractiveBallotTool"
            imageUrl="/img/tools/We-Vote-Example-Ballot.png"
            exampleUrl="https://wevote.us/more/myballot"
          />
          <CodeCopier
            title="Voter Guide Tool"
            exampleUrl="https://wevote.us/lwv_oakland"
            codeCopierButtonId="codeCopierVoterGuideTool"
            imageUrl="/img/tools/guide.png"
          />
        </div>

        <h2 className="h3">Notes:</h2>
        <ul>
          <li>You can place any page on www.WeVote.US on your organizational website.</li>
        </ul>
        <p>&nbsp;</p>

        <h1 className="h1">From Our Partner, Vote.org</h1>
        <div className="row">
          <CodeCopier
            title="Voter Registration Tool"
            sourceUrl="https://register.vote.org/?partner=111111&campaign=free-tools"
            exampleUrl="https://wevote.us/more/register"
            codeCopierButtonId="codeCopierVoterRegistrationTool"
            imageUrl="/img/tools/register.png"
          />
          <CodeCopier
            title="Absentee Ballot Tool"
            sourceUrl="https://absentee.vote.org/?partner=111111&campaign=free-tools"
            exampleUrl="https://wevote.us/more/absentee"
            codeCopierButtonId="codeCopierAbsenteeBallotTool"
            imageUrl="/img/tools/absentee.png"
          />
          <CodeCopier
            title="Check Registration Status Tool"
            sourceUrl="https://verify.vote.org/?partner=111111&campaign=free-tools"
            exampleUrl="https://wevote.us/more/verify"
            codeCopierButtonId="codeCopierCheckRegistrationStatusTool"
            imageUrl="/img/tools/verify.png"
          />
          <CodeCopier
            title="Election Reminder Tool"
            sourceUrl="https://reminders.vote.org/?partner=111111&campaign=free-tools"
            exampleUrl="https://wevote.us/more/alerts"
            codeCopierButtonId="codeCopierElectionReminderTool"
            imageUrl="/img/tools/reminders.png"
          />
        </div>

        <h2 className="h3">Vote.org Notes:</h2>
        <ul>
          <li>
            If you need access to the data gathered via your instance of the Vote.org toolset,
            <OpenExternalWebSite
              url="https://vip.vote.org"
              target="_blank"
              body="check out the Vote.org premium tools."
            />
          </li>
        </ul>
        <p>&nbsp;</p>
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding-top: ${({ padTop }) => padTop};
`;
