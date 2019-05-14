import React, {Component} from 'react'
import style from './../styles/styles.less';
// We can just import Slider or Range to reduce bundle size
import Slider from 'rc-slider/lib/Slider';

// https://github.com/topojson/topojson
import * as topojson from 'topojson';

import slider_styles from 'rc-slider/assets/index.css';

// https://d3js.org/
import _ from 'underscore';

// https://d3js.org/
import * as d3 from 'd3';

let interval;
let g, path;

class Vis extends Component {
  constructor() {
    super();

    this.state = {
      year_month_idx:0
    }
  }
  componentDidMount() {
    let width = 320;
    let height = 500;

    let projection = d3.geoMercator().center([58,57]).scale(400);
    
    let svg = d3.select('.map').append('svg').attr('width', width).attr('height', height);
    path = d3.geoPath().projection(projection);
    g = svg.append('g');

    let self = this;
    d3.json('./data/europe.topojson').then(function(topology) {
      g.selectAll('path').data(topojson.feature(topology, topology.objects.europe).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', style.path)
        .attr('fill', function(d, i) {
          return self.getCountryColor(d.properties.NAME);
        });
      self.text = g.append('text')
        .attr('alignment-baseline', 'middle')
        .attr('dy', '.35em')
        .attr('class', style.text)
        .attr('text-anchor', 'middle')
        .attr('x', '45%')
        .attr('y', '55%')
        .text(self.dates[self.state.year_month_idx].replace('M', '/'));
    });
    setTimeout(() => {
      this.createInterval();
    }, 3000);
  }
  createInterval() {
    interval = setInterval(() => {
      this.setState((state, props) => ({
        year_month_idx:this.state.year_month_idx + 1
      }), this.changeCountryColor);
      if (this.state.year_month_idx >= (this.dates.length - 1)) {
        clearInterval(interval);
        setTimeout(() => {
          this.setState((state, props) => ({
            year_month_idx:0
          }), this.createInterval);
        }, 2000);
      }
    }, 10);
  }
  componentWillUnMount() {
    clearInterval(interval);
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
  changeCountryColor(type) {
    let self = this;
    g.selectAll('path').attr('d', path)
      .attr('class', style.path_notransition)
      .attr('fill', function(d, i) {
        return self.getCountryColor(d.properties.NAME);
      });
  }
  onBeforeSliderChange(value) {
    if (interval) {
      clearInterval(interval)
    }
  }
  onSliderChange(value) {
    this.setState((state, props) => ({
      year_month_idx:value
    }), this.changeCountryColor);
  }
  onAfterSliderChange(value) {
  }
  render() {
    this.dates = _.keys(this.props.data['Finland']);
    if (this.text) {
      this.text.text(this.dates[this.state.year_month_idx].replace('M', '/'));
    }
    return (
      <div>
        <Slider
          className={style.slider_container}
          dots={false}
          max={this.dates.length - 1}
          onBeforeChange={this.onBeforeSliderChange}
          onChange={this.onSliderChange.bind(this)}
          onAfterChange={this.onAfterSliderChange.bind(this)}
          value={this.state.year_month_idx}
        />
        <div className="map"></div>
      </div>
    );
  }
}
export default Vis;