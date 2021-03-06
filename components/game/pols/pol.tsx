import React from "react";

import general from "../../general.module.css";
import styles from "./pol.module.css";

function formatMoneyString(amount) {
  if (amount >= 10) {
    return "$" + (amount / 10) + "M";
  } else {
    return "$" + (amount * 100) + "k";
  }
}

function bubbleJsx(props) {
  const bubbleStyle = styles.bubble + " " +
      (props.pol.support <= -1 ? styles.negativeSupport : "");
  
  let bubbleInfo: string | number;
  if (props.gs.stage == 3 && props.gs.primeMinister === props.polIndex) {
    bubbleInfo = "★";
  } else if (props.gs.stage === 0) {
    bubbleInfo = props.pol.baseSupport;
  } else {
    bubbleInfo = Math.round(props.pol.support);
  }

  return <div className={bubbleStyle}>{bubbleInfo}</div>;
}

function buttonsJsx(props) {
  const ownParty = props.gs.parties[props.gs.pov];

  // Return nothing if the viewer is not playing
  if (props.gs.pov == undefined || ownParty.ready) {
    return null;
  }

  const isCandidate: boolean = props.gs.provs[props.provIndex]
      .candidates.includes(props.polIndex);
  const buttons = [];
  const runInfo = {
    polIndex: props.polIndex,
    provIndex: props.provIndex
  }

  // If they can be nominated, add "Run" button
  if (props.pol.party === props.gs.pov && 
      props.gs.stage === 0 &&
      ownParty.funds >= 5 &&
      ownParty.pols.includes(props.polIndex)) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('run', runInfo)}>
        Run: $500k
      </button>
    );
  }

  // If they are currently nominated, add "Undo" button
  if (props.pol.party === props.gs.pov && 
      props.gs.stage === 0 &&
      isCandidate) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('unrun', runInfo)}>
        Undo
      </button>
    );
  }

  // If they are an active official, add "Vote" button
  if (props.gs.stage === 2 && 
      props.gs.officials.includes(props.polIndex) &&
      props.gs.parties[props.gs.pov].votes > 0) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('vote', props.polIndex)}>
        Vote
      </button>
    );
  }

  // If they have votes, add "Undo" button
  if (props.gs.stage === 2 &&
      props.gs.officials.includes(props.polIndex) &&
      props.pol.support >= 1) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('unvote', props.polIndex)}>
        Undo
      </button>
    );
  }

  if (props.gs.stage === 1 && isCandidate) {
    if (props.pol.party === props.gs.pov) {
      if (ownParty.funds >= 1 + props.pol.adsBought) {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('ad', props.polIndex)}>
            Buy ad: {formatMoneyString(1 + props.pol.adsBought)}
          </button>
        );
      }
      if (props.pol.adsBought > 0) {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('unad', props.polIndex)}>
            Undo
          </button>
        );
      }
    } else {
      if (ownParty.funds >= 1 + props.pol.adsBought) {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('smear', props.polIndex)}>
            Smear: {formatMoneyString( 1 + props.pol.adsBought)}
          </button>
        );
      }
      if (props.pol.adsBought > 0) {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('unsmear', props.polIndex)}>
            Undo
          </button>
        );
      }
    }
  }

  // If they have been bribed, add a "Flip" button or an "Undo" button
  // depending on whether they have already been flipped.
  if (ownParty.bribed != undefined &&
      ownParty.bribed.includes(props.polIndex) &&
      props.gs.stage >= 2) {
    if (props.pol.party !== props.gs.pov) {
      buttons.push(
        <button className={general.actionBtn}
            onClick={() => props.callback('flip', props.polIndex)}>
          Flip
        </button>
      );
    } else {
      buttons.push(
        <button className={general.actionBtn}
            onClick={() => props.callback('unflip',
                {polIndex: props.polIndex})}>
          Undo
        </button>
      );
    }
  }

  // If no hit has been used and the user can afford it, and the decline is
  // sufficient, add a "Hit" button.
  let hitCost = props.gs.stage == 2 ? 50 : 25;
  if (props.gs.primeMinister != null && props.gs.priority == props.pol.party) {
    hitCost += 25;
  }
  if (ownParty.hitAvailable &&
      ownParty.funds >= hitCost &&
      props.pol.party !== props.gs.pov &&
      (props.gs.stage === 1 || props.gs.stage == 2) &&
      props.gs.decline >= 2) {
    if (props.pol.hasOwnProperty('hitOrdered')) {
      buttons.push(
        <button className={general.actionBtn}
            onClick={() => props.callback('hit', props.polIndex)}>
          Hit
        </button>
      );
    } else {
      buttons.push(
        <button className={general.actionBtn}
            onClick={() => props.callback('hit', props.polIndex)}>
          Hit: {formatMoneyString(hitCost)}
        </button>
      );
    }
  }

  // If a hit has been ordered on the politician, add an "Undo" button.
  if (props.pol.hitOrdered) {
    buttons.push(
      <button className={general.actionBtn}
          onClick={() => props.callback('unhit')}>
        Undo
      </button>
    );
  }

  // If they are sympathetic, add a "Bribe" or "Undo" button depending on
  // whether they've been flipped.
  if (ownParty.sympathetic != undefined &&
      ownParty.sympathetic.includes(props.polIndex) &&
      props.pol.party !== props.gs.pov) {
    if (props.pol.flipped) {
      buttons.push(
        <button className={general.actionBtn}
            onClick={() => props.callback('unbribe', props.polIndex)}>
          Undo
        </button>
      );
    } else if (ownParty.funds >= 20 + 10 * props.gs.rounds) {
      if (props.pol.hasOwnProperty('flipped')) {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('bribe', props.polIndex)}>
            Bribe
          </button>
        );
      } else {
        buttons.push(
          <button className={general.actionBtn}
              onClick={() => props.callback('bribe', props.polIndex)}>
            Bribe: {formatMoneyString(20 + 10 * props.gs.rounds)}
          </button>
        );
      }
    }
  }

  if (buttons.length > 0) {
    return (
      <div className={styles.btnRow}>
        {buttons}
      </div>
    );
  }
  return null;
}

function nameStyle(props) {
  let nameStyle: string = styles.name;
  const ownParty = props.gs.parties[props.gs.pov];

  if (props.pol.party === props.gs.pov) {
    nameStyle += " " + styles.ownPol;
  } else if (ownParty != undefined && ownParty.bribed != undefined) {
    if (ownParty.bribed.includes(props.polIndex) ||
        (props.pol.flipped &&
         !ownParty.sympathetic.includes(props.polIndex))) {
      nameStyle += " " + styles.bribed;
    }
    if (ownParty.sympathetic.includes(props.polIndex)) {
      nameStyle += " " + styles.sympathetic;
    }
  }

  return nameStyle;
}

function Pol(props) {
  const imageUrl: string = "url('/politicians/" + props.pol.url + ".png')";
  const polParty = props.gs.parties[props.pol.party];

  return (
    <div className={styles.polWrapper}>
      <div className={styles.cardOuter}
          style={{backgroundImage: imageUrl}}>
        <div className={styles.darkenOnHover} />
        <div className={styles.spacer} />
        <span className={styles.partyAbbr + ' ' +
            (props.pol.party == props.gs.pov ? styles.ownPol : '')}>
          {polParty.abbr}
        </span>
        <span className={nameStyle(props)}>
          {props.pol.name}
        </span>
        {bubbleJsx(props)}
      </div>
      {buttonsJsx(props)}
    </div>
  );
}

export default Pol;
