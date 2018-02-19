import React, { Component } from 'react';
import AddFishForm from './AddFishForm';
import base from '../base';

class Inventory extends Component {
	constructor() {
		super();
		this.state = {
			uid: null,
			owner: null 
		}
		this.renderInventory = this.renderInventory.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.renderLogin = this.renderLogin.bind(this);
		this.authHandler = this.authHandler.bind(this);
		this.logOut = this.logOut.bind(this);
		this.authenticate = this.authenticate.bind(this);
	}
	
	componentDidMount() {
		base.onAuth((user) => {
			if(user) {
				this.authHandler({user});
			}
		});
	}

	authenticate(provider) {
		console.log(`Trying to log in with ${provider}`);
		let currProv;
		if(provider === 'twitter') currProv = new base.auth.TwitterAuthProvider();
		else if(provider === 'github') currProv = new base.auth.GithubAuthProvider();
		else if(provider === 'facebook') currProv = new base.auth.FacebookAuthProvider();		
		
		base.auth().signInWithPopup(currProv).then(this.authHandler).catch(error => console.log(error));
	}

	authHandler(authData) {
		console.log(authData);
		// grab the store info
		const storeRef = base.database().ref(this.props.storeId);
		storeRef.once('value', (snapshot) => {
			const data = snapshot.val() || {};
			// if no owner claim as our own
			if(!data.owner) {
				storeRef.set({
					owner: authData.user.uid
				})
			}
			this.setState({
				uid: authData.user.uid,
				owner: data.owner || authData.user.uid
			})
		});
	}

	logOut() {
		base.unauth();
		this.setState({ uid: null});
	}

	renderLogin() {
		return (
			<nav className="login">
				<h2>Inventory</h2>
				<p>Sign in to manage your stores inventory</p>
				<button className="github" onClick={() => this.authenticate('github')}>Login in with Github</button>
				<button className="facebook" onClick={() => this.authenticate('facebook')}>Login in with Facebook</button>
				<button className="twitter" onClick={() => this.authenticate('twitter')}>Login in with Twitter</button>			
			</nav>
		)
	}

	handleChange(e, key) {
		const fish = this.props.fishes[key];
		const updateFish = {...fish, [e.target.name]: e.target.value};
		this.props.updateFish(key, updateFish);
	}

	renderInventory(key) {
		const fish = this.props.fishes[key];

		return (
			<div className="fish-edit" key={key}>
				<input type="text" name="name" value={fish.name} placeholder="Fish Name" onChange={(e) => this.handleChange(e, key)} />
				<input type="text" name="price" value={fish.price} placeholder="Fish Price"onChange={(e) => this.handleChange(e, key)} />
				<select name="status" value={fish.value} onChange={(e) => this.handleChange(e, key)} >
					<option value="available">Fresh!</option>
					<option value="unavailable">Sold Out!</option>
				</select>

				<textarea type="text" name="desc" value={fish.desc} placeholder="Fish Desc" onChange={(e) => this.handleChange(e, key)} />
				<input type="text" name="image" value={fish.image} placeholder="Fish Image"onChange={(e) => this.handleChange(e, key)} />
				<button onClick={() => this.props.removeFish(key)}>Remove Fish</button>
			</div> 
		);
	}

	render() {
		const logout = <button onClick={this.logOut}>Log Out!</button>
		// check if they are not logged in at all
		if(!this.state.uid) {
			return <div>{this.renderLogin()}</div>
		}
		
		// check if they are the owner of the curren store
		if(this.state.uid !== this.state.owner) {
			return (
				<div><p>Sorry you are not the owner of this store!</p>{logout}</div>
			)
		}

		return (
			<div>
				<h2>Inventory</h2>
				{logout}
				{Object.keys(this.props.fishes).map(this.renderInventory)}
				<AddFishForm addFish={this.props.addFish} />
				<button onClick={this.props.loadSamples}>Load Sample Fishes</button>
			</div>
		);
	}
}

Inventory.propTypes = {
	fishes: React.PropTypes.object.isRequired,
	updateFish: React.PropTypes.func.isRequired,
	removeFish: React.PropTypes.func.isRequired,
	addFish: React.PropTypes.func.isRequired,
	loadSamples: React.PropTypes.func.isRequired,
	storeId: React.PropTypes.string.isRequired
}
export default Inventory;