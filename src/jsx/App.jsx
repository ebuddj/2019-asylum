import React, {Component} from 'react'
import style from './../styles/styles.less';

// https://alligator.io/react/axios-react/
import axios from 'axios';

import Vis from './Vis.jsx';

class Layout extends Component {
  constructor() {
    super();
    
    this.state = {
      data:false
    }
  }
  componentDidMount() {
    let self = this;
    axios.get('./data/data.json', {
    })
    .then(function (response) {
      self.setState((state, props) => ({
        data:response.data
      }));
    })
    .catch(function (error) {
    })
    .then(function () {
    });
  }
  render() {
    return (
      <div>
        <Vis data={this.state.data} />
      </div>
    );
  }
}
export default Layout;