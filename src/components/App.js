import React, { Component } from 'react';
import Header from './Header';
import Order from './Order';
import Inventory from './Inventory';
import Fish from './Fish';
import sampleFishes from '../sample-fishes';
import base from '../base';

class App extends Component {
	constructor() {
		super();
		this.state = {
			fishes: {},
			order: {}
		};
		this.addFish = this.addFish.bind(this);
		this.loadSamples = this.loadSamples.bind(this);
		this.updateFish = this.updateFish.bind(this);
		this.removeFish = this.removeFish.bind(this);
		this.addToOrder = this.addToOrder.bind(this);
		this.removeFromOrder = this.removeFromOrder.bind(this);
	}

	componentWillMount() {
		this.ref = base.syncState(`${this.props.params.storeId}/fishes`, {
			context: this,
			state: 'fishes'
		});

		const localStorageRef = localStorage.getItem(`order-${this.props.params.storeId}`);

		if(localStorageRef) {
			this.setState({
				order: JSON.parse(localStorageRef)
			});
		}
	}

	componentWillUnmount() {
		base.removeBinding(this.ref);
	}

	componentWillUpdate(nextProps, nextState) {
		localStorage.setItem(`order-${this.props.params.storeId}`, JSON.stringify(nextState.order));
	}

	addFish(fish) {
		const fishes = {...this.state.fishes};
		const timestamp = Date.now();
		fishes[`fish-${timestamp}`] = fish;
		this.setState({ fishes });
	}

	updateFish(key, updateFish) {
		const fishes = {...this.state.fishes};
		fishes[key] = updateFish;
		this.setState({ fishes });
	}

	removeFish(key) {
		const fishes = {...this.state.fishes};
		fishes[key] = null;
		this.setState({ fishes });
	}

	loadSamples() {
		this.setState({
			fishes: sampleFishes
		});
	}

	addToOrder(key) {
		const order = {...this.state.order};
		order[key] = order[key] + 1 || 1;
		this.setState({ order });
	}

	removeFromOrder(key) {
		const order = {...this.state.order};
		delete order[key];
		this.setState({ order })
	}

	render() {
		return (
			<div className="catch-of-the-day">
				<div className="menu">
					<Header tagline="Fresh Seafood Market" />
						<ul className="list-of-fishes">
							{Object.keys(this.state.fishes).map(fish => <Fish key={fish} index={fish} addToOrder={this.addToOrder} details={this.state.fishes[fish]} />)}
						</ul>
				</div>
				<Order 
					params={this.props.params} 
					order={this.state.order} 
					fishes={this.state.fishes} 
					removeFromOrder={this.removeFromOrder}
				/>
				<Inventory 
					updateFish={this.updateFish} 
					loadSamples={this.loadSamples} 
					addFish={this.addFish} 
					storeId={this.props.params.storeId}
					removeFish={this.removeFish}
					fishes={this.state.fishes} />
			</div>
		);
	}
}

App.propTypes = {
	params: React.PropTypes.object.isRequired
}

export default App;