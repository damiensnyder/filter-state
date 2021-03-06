import React from "react";

import general from "../../general.module.css";
import styles from "./helper-bar.module.css";

interface HelperBarProps {
  gs: any,
  callback: (string) => void,
  activeTab: number,
  tabCallback: (number) => void
}

const RACE_NO_DECLINE: string[] = [
  "This is the campaign stage. Each province has a race going on, and " +
  "your goal is to win as many of the races as possible. (Click \"Next\" to " +
  "keep reading)",
  "To view the races happening in each province, click the names of the " +
  "provinces at the top of your screen, or click the Next and Back buttons " +
  "after you close these help messages. (Click \"Next\" again)",
  "The campaign is three rounds long. This is the {} round. At the end of " +
  "the third round, the politician with the most \"support\" in each " +
  "province (the circled number) becomes an official.",
  "To win races, you can buy ads for your own candidates (highlighted in " +
  "blue), or smear your opponents' candidates. Buying ads increases a " +
  "politician's support, and smearing decreases it (but not below zero).",
  "Smearing or buying an ad gets more expensive each time you do it in a " +
  "round. You can see how much money you have left next to your party's " +
  "name. (Click \"Hide\" to hide these help messages)"
];
const RACE_ONE_DECLINE: string[] = [
  "At the end of each round, the nation sinks deeper into disarray. The " +
  "first thing to go is loyalty. Each party can now bribe {} " +
  "from another party. Check each province to find who you can bribe.",
  "Once you bribe a politician, any time that politician is an official, " +
  "you can 'flip' them and they become a member of your own party and you " +
  "can control who they vote for prime minister.",
  "Like ads and smears, bribing gets more expensive after each stage of the " +
  "race. But be warned: even if you bribe someone, they might not get elected."
];
const RACE_TWO_DECLINE: string[] = [
  "The nation has become more chaotic. Each party can now call in one " +
  "\"hit\" to assassinate another party's politician. Don't be too " +
  "trigger-happy, though: once you call in a hit, you'll have to wait three " +
  "more rounds to use another.",
  "Calling in a hit costs $2.5M more when the politician is an official, " +
  "and you can't call a hit on the prime minister."
];
const RACE_SUSPENDED: string[] = [
  "Another party is seeking to take over the nation once and for all. If {} " +
  "gains the prime minister in this election cycle, they will seize power " +
  "totally and win the game.",
  "By ignoring constitutional checks, they have an advantage, so you must " +
  "work with the other parties to stop them. But beware: whoever gains the " +
  "prime minister instead will be able to attempt a takeover themselves in " +
  "the next round."
];
const RACE_SUSPENDING: string[] = [
  "You have just suspended the constitution. By doing this, you have gained " +
  "an advantage over the other parties, but if you fail to recapture the " +
  "prime minister, you will be penalized for your constitutional crimes.",
  "If you gain the prime minister again, you seize power win the game. But " +
  "if you fail, you will lose all your funds and your politicians will " +
  "temporarily have lower support."
];

const VOTING: string[] = [
  "Vote for the official you want to become prime minister. Each of your " +
  "officials have one vote. The party that controls the prime minister " +
  "will get a bonus in the next round, so try to win!",
  "If the votes are tied, another round of voting will begin. After three " +
  "rounds of voting, a tiebreaker will be used."
];

const CHOICE_OWN_PM: string[] = [
  "Since you control the prime minister, you can choose whether to rule " +
  "your nation for the people or for yourself. No matter which choice you " +
  "make, though, the nation will sink further into disarray."
];
const CHOICE_OTHER_PM: string[] = [
  "Since {} controls the prime minister, they can choose whether to rule " +
  "the nation for the people or for themselves. No matter which choice they " +
  "make, though, the nation will sink further into disarray."
];

class HelperBar extends React.Component {
  props: HelperBarProps;
  state: {
    helpIsVisible: boolean,
    helpMessageIndex: number
  };

  constructor(props: HelperBarProps) {
    super(props);

    this.state = {
      helpIsVisible: false,
      helpMessageIndex: 0
    };
  }

  toggleHelp(): void {
    this.setState({
      helpIsVisible: !this.state.helpIsVisible,
      helpMessageIndex: 0
    });
  }

  readyButtonLabel(): string {
    if (this.props.gs.parties[this.props.gs.pov].ready) {
      return "Cancel";
    }
    if (!this.props.gs.started) {
      return "Ready";
    }
    if (this.props.gs.ended) {
      return "Rematch";
    }
    return "Done";
  }

  explanationJsx(): React.ReactElement {
    if (this.state.helpIsVisible) {
      return (
        <div className={styles.helpText}>
          {this.currentHelpMessageSet.bind(this)()
              [this.state.helpMessageIndex]}
        </div>
      );
    }

    if (this.props.gs.stage == 2) {
      return null;
    }

    if (this.props.gs.stage == 3) {
      let newDecline: string = "each party can bribe one politician";
      const newSuspend: string = " The next prime minister's party can " +
          "suspend the constitution (!).";

      if (this.props.gs.decline % 3 == 1) {
        newDecline += " AND can call a hit on one politician";
      }

      return (
        <div className={styles.helpText}>
          Next round: {newDecline}.
          {this.props.gs.decline >= 2 ? newSuspend : ""}
        </div>
      );
    }

    return null;
  }

  // Return the set of help messages appropriate to the current situation.
  currentHelpMessageSet(): string[] {
    if (this.props.gs.stage == 1) {
      if (this.props.gs.decline == 0) {
        const roundCardinals = ["first", "second", "third"];
        RACE_NO_DECLINE[2] = RACE_NO_DECLINE[2].replace('{}',
            roundCardinals[this.props.gs.rounds]);
        return RACE_NO_DECLINE;
      }
      if (this.props.gs.decline == 1) {
        RACE_ONE_DECLINE[0] = RACE_ONE_DECLINE[0].replace('{}',
            '' + this.props.gs.rounds + ' politician' +
            (this.props.gs.rounds > 0 ? 's' : ''));
        return RACE_ONE_DECLINE;
      }
      if (this.props.gs.suspender != this.props.gs.pov) {
        return RACE_SUSPENDING;
      }
      if (this.props.gs.suspender != null) {
        RACE_SUSPENDED[0] = RACE_SUSPENDED[0].replace('{}',
            '' + this.props.gs.parties[this.props.gs.suspender].name);
        return RACE_SUSPENDED;
      }
      return RACE_TWO_DECLINE;
    }
    if (this.props.gs.stage == 2) {
      return VOTING;
    }

    const pmParty: number =
        this.props.gs.pols[this.props.gs.primeMinister].party;
    if (pmParty == this.props.gs.pov) {
      return CHOICE_OWN_PM;
    }
    CHOICE_OTHER_PM[0] = CHOICE_OTHER_PM[0].replace('{}',
        '' + this.props.gs.parties[pmParty].name);
    return CHOICE_OTHER_PM;
  }

  goBack(): void {
    if (!this.state.helpIsVisible) {
      this.props.tabCallback(this.props.activeTab - 1);
    } else {
      this.setState({
        helpMessageIndex: this.state.helpMessageIndex - 1,
      });
    }
  }

  goForward(): void {
    if (!this.state.helpIsVisible) {
      this.props.tabCallback(this.props.activeTab + 1);
    } else {
      this.setState({
        helpMessageIndex: this.state.helpMessageIndex + 1
      });
    }
  }

  render(): React.ReactElement {
    if (this.props.gs.parties[this.props.gs.pov] == null) {
      return null;
    }

    const buttonStyle: string = general.actionBtn + ' ' +
        styles.bigButton + ' ';
    const inactiveStyle: string = general.inactiveBtn2 + ' ' +
        styles.bigButton + ' ';
    const priorityStyle: string = buttonStyle + general.priorityBtn + ' ';

    let backButton = (
      <button className={buttonStyle}
          onClick={this.goBack.bind(this)}>
        &lt;&lt; Back
      </button>
    );
    let nextButton: React.ReactElement = (
      <button className={buttonStyle}
          onClick={this.goForward.bind(this)}>
        Next &gt;&gt;
      </button>
    );
    if ((!this.state.helpIsVisible && this.props.activeTab == 0) ||
        (this.state.helpIsVisible && this.state.helpMessageIndex == 0)) {
      backButton = (
        <button className={inactiveStyle}>
          &lt;&lt; Back
        </button>
      );
    }
    if ((!this.state.helpIsVisible &&
            this.props.activeTab == this.props.gs.provs.length - 1) ||
        this.state.helpMessageIndex ==
            this.currentHelpMessageSet.bind(this)().length - 1) {
      nextButton = (
        <button className={inactiveStyle}>
          Next &gt;&gt;
        </button>
      );
    }
    if (!this.state.helpIsVisible && this.props.gs.stage > 1) {
      backButton = null;
      nextButton = null;
    }

    if (!this.props.gs.started) {
      return (
        <button className={priorityStyle}
            onClick={() => this.props.callback('ready')}>
          {this.readyButtonLabel()}
        </button>
      )
    }

    return (
      <div className={styles.outerWrapper}>
        {this.state.helpIsVisible ? this.explanationJsx.bind(this)() : null}
        <div className={styles.buttonsRow}>
          <button className={priorityStyle}
              onClick={this.toggleHelp.bind(this)}>
            {this.state.helpIsVisible ? "Hide" : "Help"}
          </button>
          {backButton}
          {nextButton}
          {this.state.helpIsVisible ? null : this.explanationJsx.bind(this)()}
          <button className={priorityStyle}
              onClick={() => this.props.callback('ready')}>
            {this.readyButtonLabel()}
          </button>
        </div>
      </div>
    );
  }
}



export default HelperBar;
