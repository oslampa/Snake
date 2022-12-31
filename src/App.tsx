import React from "react";
import Board from "./Board";
import styles from "./App.module.scss";

export enum GameStatus {
  Left,
  Right,
  Up,
  Down,
  Start,
  Won,
  Lost,
}

interface AppState {
  status: GameStatus;
  snake: [number, number][];
  fruit: [number, number];
}

interface AppProps {
  side: number;
  tick: number;
}

export default class App extends React.Component<AppProps, AppState> {
  interval?: NodeJS.Timer;

  constructor(props: AppProps) {
    super(props);
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      this.buttonPressed(e);
    });
    this.state = this.getBaseState();
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), this.props.tick);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  tick() {
    this.gameStep();
  }

  buttonPressed(e: KeyboardEvent) {
    const statusAfterButton = this.buttonToState(e, this.state.status);
    if (statusAfterButton === GameStatus.Start) {
      this.setState(this.getBaseState());
    } else {
      const newState = { ...this.state };
      newState.status = statusAfterButton;
      this.setState(newState);
    }
  }

  gameStep() {
    if (
      [GameStatus.Start, GameStatus.Won, GameStatus.Lost].includes(
        this.state.status
      )
    ) {
      return;
    }
    const newState = { ...this.state };
    const newHead = this.getNewHead(newState.status, this.state.snake[0]);
    const ateFruit =
      newHead[0] === this.state.fruit[0] && newHead[1] === this.state.fruit[1];
    newState.snake = [
      newHead,
      ...this.state.snake.slice(
        0,
        ateFruit ? this.state.snake.length : this.state.snake.length - 1
      ),
    ];
    newState.status = this.getNewGameStatus(newState.snake, newState.status);
    if (ateFruit) {
      newState.fruit = this.getNewFruit(newState.snake);
    }
    this.setState(newState);
  }

  getNewFruit(snake: [number, number][]) {
    var newFruit: [number, number];
    do {
      newFruit = [
        Math.floor(Math.random() * this.props.side),
        Math.floor(Math.random() * this.props.side),
      ];
    } while (snake.find((p) => p[0] === newFruit[0] && p[1] === newFruit[1]));
    return newFruit;
  }

  getNewHead(key: GameStatus, head: [number, number]): [number, number] {
    switch (key) {
      case GameStatus.Left:
        return [head[0], head[1] - 1];
      case GameStatus.Right:
        return [head[0], head[1] + 1];
      case GameStatus.Up:
        return [head[0] - 1, head[1]];
      case GameStatus.Down:
        return [head[0] + 1, head[1]];
      default:
        return head;
    }
  }

  getNewGameStatus(snake: [number, number][], status: GameStatus) {
    if (snake.length === this.props.side * this.props.side) {
      return GameStatus.Won;
    }
    const head = snake[0];
    if (
      head[0] === -1 ||
      head[0] === this.props.side ||
      head[1] === -1 ||
      head[1] === this.props.side ||
      snake
        .slice(1, snake.length)
        .find((p) => p[0] === head[0] && p[1] === head[1])
    ) {
      return GameStatus.Lost;
    }
    return status;
  }

  buttonToState(e: KeyboardEvent, status: GameStatus): GameStatus {
    if ([GameStatus.Won, GameStatus.Lost].includes(this.state.status)) {
      if (e.key === "Enter") {
        return GameStatus.Start;
      } else {
        return status;
      }
    } else if (e.key === "ArrowLeft" && status !== GameStatus.Right) {
      return GameStatus.Left;
    } else if (e.key === "ArrowRight" && status !== GameStatus.Left) {
      return GameStatus.Right;
    } else if (e.key === "ArrowUp" && status !== GameStatus.Down) {
      return GameStatus.Up;
    } else if (e.key === "ArrowDown" && status !== GameStatus.Up) {
      return GameStatus.Down;
    } else {
      return status;
    }
  }

  getBaseState(): AppState {
    const snake: [number, number][] = [
      //[SIDE - 5, SIDE / 2],
      //[SIDE - 4, SIDE / 2],
      //[SIDE - 3, SIDE / 2],
      //[SIDE - 2, SIDE / 2],
      [this.props.side - 1, this.props.side / 2],
    ];
    return {
      fruit: this.getNewFruit(snake),
      status: GameStatus.Start,
      snake,
    };
  }

  render(): React.ReactNode {
    var statusBar: React.ReactNode;
    if (this.state.status === GameStatus.Start) {
      statusBar = <div className={styles.statusBar}>Use arrow keys.</div>;
    } else if (this.state.status === GameStatus.Won) {
      statusBar = (
        <div className={styles.statusBar}>
          You won!
          <br />
          Press Enter to restart.
        </div>
      );
    } else if (this.state.status === GameStatus.Lost) {
      statusBar = (
        <div className={styles.statusBar}>
          You lost!
          <br />
          Press Enter to restart.
        </div>
      );
    } else {
      statusBar = (
        <div className={styles.statusBar}>
          Score: {this.state.snake.length - 1}
        </div>
      );
    }
    return (
      <div className={styles.app}>
        <Board
          side={this.props.side}
          snake={this.state.snake}
          fruit={this.state.fruit}
          status={this.state.status}
        />
        {statusBar}
      </div>
    );
  }
}
