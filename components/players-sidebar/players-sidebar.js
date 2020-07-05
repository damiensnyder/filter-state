import React from 'react';

import OtherPlayer from './other-player';
import OwnPlayer from './own-player';
import styles from './players-sidebar.module.css';

class PlayersSidebar extends React.Component {
  constructor(props) {
    super(props);
  }

  // Converts the array of other players in the game to an array of JSX objects.
  playersToJsx() {
    const playersJsx = [];
    for (var i = 0; i < this.props.gs.parties.length; i++) {
      if (i === this.props.gs.pov) {
        playersJsx.push(
          <OwnPlayer gs={this.props.gs}
                     callback={this.props.callback}
                     index={i}
                     key={i} />
        );
      } else {
        playersJsx.push(
          <OtherPlayer gs={this.props.gs}
                       callback={this.props.callback}
                       index={i}
                       key={i} />
        );
      }
    }
    return playersJsx;
  }

  render() {
    // If no other players have joined, display a message.
    if (this.props.gs.parties.length === 0) {
      return (
        <div id={styles.noPlayersWrapper}>
          <div>No other players have joined yet. Be the first!</div>
        </div>
      );
    }

    return this.playersToJsx();
  }
}

export default PlayersSidebar;