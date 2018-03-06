import  React from 'react';
import  Map from '../Map/Map';
import Table from '../Table/Table'
import Filter from '../Filter/Filter'
import {rename, filterData, getData, getMarkersFromGroup} from '../Helpers'
import _ from 'lodash';
import './controller.css';
import logo from '../Card/logo.svg';

/*Props: Typically a single config file in the form of a JSON object*/

/*This is a component that acts as a default controller for the common Map, Table, Filter Combo, this is
* by no means a standard or the only way to do things, this is simply my implementation that is free to be reused
* you are welcome to combine components your own way.*/

export default class Controller extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            position: this.props.config.center,
            markers: [],
            marker: '',
            filters:[],
            data: [],
            group: [],
            loading: true,
            opts: this.props.config.headers.map(item => {
                return item.opts ? {name: item.name, opts: item.opts} : null
            })
        }
    }

    /*Function passed to table to pull a new center and the marker information from the table*/
    getPosition = position => {
        if(!this.props.config.fromGroup){
            let newPosition = [];
            newPosition.push(Number(position.location_latitude));
            newPosition.push(Number(position.location_longitude));
            this.setState({
                position: newPosition,
                marker: position
            })
        }
        else{
            let id = this.props.config.fromGroup.id;
            let url = this.props.config.fromGroup.url;
            getMarkersFromGroup([position], url, id, this);
        }
    };

    /*Function used to pull filter information from filter components*/
    pullData = (data, key) => {
        let tmpFilters = this.state.filters;
        tmpFilters[key] = data;
        this.setState({
            filters: tmpFilters
        })
    };


    componentWillMount(){
        if(this.props.config.url){
            getData(this.props.config.url, this);
        }
    }


    render(){
        let data = filterData(this.state.data, this.state.filters, this.props.config.string_filter);
        if(this.props.config.uniqBy){
            data = _.uniqBy(data, this.props.config.uniqBy)
        }
        return (
            this.state.loading ?
                <div className="card no-border">
                    <img className="spinner-center" src={logo} alt="logo"/>
                </div>
                :

                <div>
                  <div className="filter-container">
                        {this.props.config.headers.map((header, key) => {
                            if(header.filter){
                                return <div className="filter" style={{width: "12.5%"}} key={key}><Filter myKey={key} pullData={this.pullData} name={header.name} type={header.filter} opts={header.opts ? header.opts : ''} display={header.opts ? header.display_opts : ''}label={rename(header.alt)} key={key}/></div>
                            }else {
                                return ''
                            }
                        })}
                  </div>
                  <div className="controller-container">
                            <Table fromGroup={this.props.config.fromGroup ? this.props.config.fromGroup : null} data={data}  filter={this.state.filters} getPosition={this.getPosition} headers={this.props.config.headers}/>
                            <Map id={this.state.id ? this.state.id : -1} bounds={this.state.bounds} fromGroup={this.props.config.fromGroup ? this.props.config.fromGroup : null} marker_type={this.props.config.marker_type} color={this.props.config.headers[this.props.config.color]} match={this.props.config.id_match} headers={this.props.config.headers} marker={this.props.config.fromGroup ? this.state.group: this.state.marker}  markers={data} center={this.state.position}/>
                  </div>
                </div>

        );
    }
}
