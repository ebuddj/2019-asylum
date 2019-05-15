import React, {Component} from 'react'
import style from './../styles/styles.less';

// https://github.com/topojson/topojson
import * as topojson from 'topojson';

// https://www.npmjs.com/package/rc-slider
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';

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
      selected_country:'',
      year_month_idx:0
    }
  }
  componentDidMount() {
    let self = this;

    let width = 320;
    let height = 500;

    let projection = d3.geoMercator().center([58,57]).scale(400);
    
    let svg = d3.select('.' + style.map).append('svg').attr('width', width).attr('height', height);
    path = d3.geoPath().projection(projection);
    g = svg.append('g');

    let offsetL = document.getElementsByClassName(style.map)[0].offsetLeft + 10;
    let offsetT = document.getElementsByClassName(style.map)[0].offsetTop + 10;
    let tooltip = d3.select('.' + style.map)
      .append('div')
      .attr('class', style.hidden + ' ' + style.tooltip);
    function showTooltip (d) {
      let country = d.properties.NAME;
      let max = {
        date:'',
        value:0
      };
      _.each(self.props.data[country], (value, date) => {
        if (value > max.value) {
          max.value = value,
          max.date = date;
        }
      });
      let mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
      if (self.props.data[country]) {
        tooltip.classed(style.hidden, false)
          .attr('style', 'left: ' + (mouse[0] + offsetL) +  'px; top:' + (mouse[1] + offsetT) + 'px;')
          .html('<h4>' + country + '</h4><p>Situation was the worst in ' + max.date.replace('M', '/') + ' with ' + max.value.toLocaleString() + ' asylum seekers.');
      }
    }
    function selected (d) {
      if (self.props.data[d.properties.NAME]) {
        if (!d3.select(this).classed(style.selected)) {
          self.setState((state, props) => ({
            selected_country: d.properties.NAME
          }));
          d3.select('.' + style.selected_country).classed(style.hidden, false);
          d3.select('.' + style.selected).classed(style.selected, false);
          d3.select(this.parentNode.appendChild(this)).classed(style.selected, true);
        }
        else {
          d3.select('.' + style.selected_country).classed(style.hidden, true);
          d3.select('.' + style.selected).classed(style.selected, false);
          self.setState((state, props) => ({
            selected_country: ''
          }));
        }
      }
      else {
        self.setState((state, props) => ({
          selected_country: ''
        }));
      }
    }

    d3.json('./data/europe.topojson').then(function(topology) {
      g.selectAll('path').data(topojson.feature(topology, topology.objects.europe).features)
        .enter()
        .append('path')
        .attr('d', path)
        .on('mousemove', showTooltip)
        .on('mouseout', function (d,i) {
          tooltip.classed(style.hidden, true);
         })
        .on('click', selected)
        .attr('class', style.path)
        .attr('fill', function(d, i) {
          return self.getCountryColor(d.properties.NAME);
        });
      self.text = svg.append('text')
        .attr('alignment-baseline', 'middle')
        .attr('dy', '.35em')
        .attr('class', style.text)
        .attr('text-anchor', 'middle')
        .attr('x', '50%')
        .attr('y', '55%')
        .html(self.dates[self.state.year_month_idx].replace('M', '/'));
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
    }, 200);
  }
  componentWillUnMount() {
    clearInterval(interval);
  }
  getCountryColor(country) {
    if (this.props.data[country] !== undefined) {
      if (this.props.data[country][this.dates[this.state.year_month_idx]] > 100) {
        return 'rgba(255, 0, 0, ' + ((this.props.data[country][this.dates[this.state.year_month_idx]]) / 1) / _.max((_.values(this.props.data[country]))) + ')';
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
      this.text.html(this.dates[this.state.year_month_idx].replace('M', '/'));
    }
    let selected_value = 0;
    if (this.state.selected_country && this.props.data[this.state.selected_country]) {
      selected_value = this.props.data[this.state.selected_country][this.dates[this.state.year_month_idx]];
      if (selected_value === -1) {
        this.text.html(this.dates[this.state.year_month_idx].replace('M', '/') + ' ' + this.state.selected_country + ' –');
      }
      else {
        this.text.html(this.dates[this.state.year_month_idx].replace('M', '/') + ' ' + this.state.selected_country + ' ' + selected_value.toLocaleString());
      }
    }
    return (
      <div>
        <Slider
          className={style.slider_container}
          dots={false}
          max={this.dates.length - 1}
          onAfterChange={this.onAfterSliderChange.bind(this)}
          onBeforeChange={this.onBeforeSliderChange}
          onChange={this.onSliderChange.bind(this)}
          value={this.state.year_month_idx}
        />
        <div className={style.map}></div>
      </div>
    );
  }
}
export default Vis;