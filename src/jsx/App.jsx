import React, {Component} from 'react'
import style from './../styles/styles.less';

// https://alligator.io/react/axios-react/
import axios from 'axios';

// https://underscorejs.org/
import _ from 'underscore';

import Vis from './Vis.jsx';

class App extends Component {
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
      <div className={style.plus}>
        <h3>Asylum and first time asylum applicants per country from 2012 to 2019</h3>
        <Vis data={this.state.data}/>
        <p>Source: <a href="https://ec.europa.eu/eurostat/web/asylum-and-managed-migration/data/database">Eurostats</a></p>
      </div>
    );
  }
}
export default App;