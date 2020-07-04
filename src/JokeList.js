import React, { Component } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./JokeList.css";
import Jokes from "./Jokes";

export default class JokeList extends Component {
  static defaultProps = {
    jokesLength: 10,
  };
  constructor(props) {
    super(props);

    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false,
      isloaded: true,
    };

    this.preventDuplicate = new Set(this.state.jokes.map((joke) => joke.joke));
    console.log(this.preventDuplicate);
  }

  async componentDidMount() {
    if (this.state.jokes.length === 0) {
      this.getJokes();
    }
  }
  getJokes = async () => {
    let jokes = [];
    try {
      while (jokes.length < this.props.jokesLength) {
        const res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" },
        });
        if (!res.status === 200) {
          throw new Error("Request Failed!");
        }
        if (!this.preventDuplicate.has(res.data.joke)) {
          jokes.push({
            joke: res.data.joke,
            vote: 0,
            id: uuidv4(),
          });
        } else {
          console.log("Found a duplicate");
          console.log(res.data.joke);
        }
        // console.log(res.data);
      }
      this.setState(
        (currState) => ({
          jokes: [...currState.jokes, ...jokes],
          loading: false,
        }),
        () =>
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
    } catch (err) {
      alert(err);
      this.setState({
        loading: false,
      });
    }
  };
  handleVote = (id, delta) => {
    this.setState(
      (currState) => ({
        jokes: currState.jokes.map((joke) =>
          joke.id === id ? { ...joke, vote: joke.vote + delta } : joke
        ),
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  };
  handleClick = () => {
    this.setState({ loading: true }, () => this.getJokes());
  };
  render() {
    const jokes = this.state.jokes.sort((a, b) => b.vote - a.vote);
    // console.log("this.state.jokes", this.state.jokes);
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <div className="loader"></div>
          <i className="far fa-8x fa-laugh fa-spin"></i>
          <h1 className="JokeList-title">Loading...</h1>
        </div>
      );
    }
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes
          </h1>
          <img
            src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
            alt=""
          />
          <button className="JokeList-getmore" onClick={this.handleClick}>
            New Jokes
          </button>
        </div>
        <div className="JokeList-jokes">
          {jokes.map((j) => (
            <Jokes
              key={j.id}
              joke={j.joke}
              vote={j.vote}
              id={j.id}
              upVote={this.handleVote}
              downVote={this.handleVote}
            />
          ))}
        </div>
      </div>
    );
  }
}
