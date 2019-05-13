import React, {Component} from 'react'
import style from './../styles/styles.less';

// https://github.com/topojson/topojson
import * as topojson from 'topojson';


// https://d3js.org/
import _ from 'underscore';

// https://d3js.org/
import * as d3 from 'd3';

class Vis extends Component {
  constructor() {
    super();

    this.state = {
      year_month_idx:0
    }
  }
  componentDidMount() {
    let width = 900;
    let height = 600;

    let projection = d3.geoMercator().center([20,60]).scale(500);
    
    let svg = d3.select('.map').append('svg').attr('width', width).attr('height', height);
    let path = d3.geoPath().projection(projection);
    let g = svg.append('g');
    let self = this;
    d3.json('./data/europe.topojson').then(function(topology) {
      g.selectAll('path').data(topojson.feature(topology, topology.objects.europe).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', function(d, i) {
          return self.getCountryColor(d.properties.NAME);
        });
    });
    setTimeout(() => {
      this.interval = setInterval(() => {
        self.setState((state, props) => ({
          year_month_idx:this.state.year_month_idx + 1,
        }));
        if (this.state.year_month_idx >= (this.dates.length - 1)) {
          clearInterval(this.interval);
        }
        g.selectAll('path').attr('d', path)
          .attr('fill', function(d, i) {
            return self.getCountryColor(d.properties.NAME);
          });
      }, 300);
    }, 500);
  }
  componentWillUnMount() {
    clearInterval(this.interval);
  }
  getCountryColor(country) {
    if (this.props.data[country] !== undefined) {
      let max = _.max((_.values(this.props.data[country])));
      if (this.props.data[country][this.dates[this.state.year_month_idx]] > 100) {
        return 'rgba(255, 0, 0, ' + ((this.props.data[country][this.dates[this.state.year_month_idx]]) / 1) / max + ')';
      }
      else {
        return '#fff';
      }
    }
    else {
      return '#fff';
    }
  }
  render() {
    this.dates = _.keys(this.props.data['Finland']);
    return (
      <div>
        <h3>{this.dates[this.state.year_month_idx]}</h3>
        <div className="map"></div>
      </div>
    );
  }
}
export default Vis;