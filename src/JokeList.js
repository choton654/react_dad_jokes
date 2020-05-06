import React, { Component } from 'react';
import Joke from './Joke';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './JokeList.css';

class JokeList extends Component {
	static defaultProps = {
		numberOfJokes: 10,
	};

	constructor(props) {
		super(props);
		this.state = {
			jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'),
			isLoading: false,
		};
		this.seenJokes = new Set(this.state.jokes.map((j) => j.text));
		this.handleClick = this.handleClick.bind(this);
	}

	componentDidMount() {
		if (this.state.jokes.length === 0) this.getJokes();
	}
	async getJokes() {
		let jokes = [];
		while (jokes.length < this.props.numberOfJokes) {
			let response = await axios.get('https://icanhazdadjoke.com/', {
				headers: { Accept: 'application/json' },
			});
			let newJokes = response.data.joke;
			if (!this.seenJokes.has(newJokes)) {
				jokes.push({ id: uuidv4(), text: newJokes, votes: 0 });
			} else {
				console.log('FOUND DUPLICATE');
				console.log(newJokes);
			}
		}
		this.setState(
			(st) => ({ isLoading: false, jokes: [...st.jokes, ...jokes] }),
			() =>
				window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes)),
		);
	}

	handleVotes(id, score) {
		this.setState(
			(st) => ({
				jokes: st.jokes.map((j) =>
					j.id === id ? { ...j, votes: j.votes + score } : j,
				),
			}),
			() =>
				window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes)),
		);
	}
	handleClick() {
		this.setState({ isLoading: true }, this.getJokes);
	}
	render() {
		if (this.state.isLoading) {
			return (
				<div className='spiner'>
					<i className='far fa-8x fa-laugh fa-spin' />
					<h1 className='JokeList-title'>Loading...</h1>
				</div>
			);
		}
		let sort = this.state.jokes.sort((a, b) => b.votes - a.votes);
		const jokes = sort.map((j) => (
			<Joke
				key={j.id}
				text={j.text}
				votes={j.votes}
				upVotes={() => this.handleVotes(j.id, 1)}
				downVotes={() => this.handleVotes(j.id, -1)}
			/>
		));
		return (
			<div className='JokeList'>
				<div className='JokeList-sidebar'>
					<h1 className='JokeList-title'>
						<span>Bad</span> jokes
					</h1>
					<img src='https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTeMb6uL7NyYzClk8RgT0JBgvGFZltIiDVS-Mbu5IFkQ1ru2-X5&usqp=CAU' />
					<button className='JokeList-getmore' onClick={this.handleClick}>
						FETCH JOKES
					</button>
				</div>

				<div className='JokeList-jokes'>{jokes}</div>
			</div>
		);
	}
}

export default JokeList;
