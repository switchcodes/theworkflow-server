import express, { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import "dotenv/config";
import path from "path";
if (process.env["API_KEY"] === undefined) throw Error("API_KEY is not set in .env");

interface Scores {
	[name: string]: number;
}

var scores: Scores = {};
const app = express();
const API_KEY = process.env["API_KEY"];

const checkForAPIKey = (req: Request, res: Response, next: NextFunction) => {
	const apiKey = req.get("X-API-KEY");
	if (apiKey === null || apiKey === undefined) {
		res.status(401).send("API key is missing");
		return;
	}
	if (apiKey !== API_KEY) {
		res.status(401).send("Invalid API key");
		return;
	}
	next();
};

const notAvailable = (req: Request, res: Response) => {
	res.sendStatus(405);
};

const getLeaderboard = (req: Request, res: Response) => {
	console.log("leaderboard called");
	res.status(200).json(scores);
};

const postLeaderboard = (req: Request, res: Response) => {
	console.log("leaderboard called");
	res.status(200).send("post hello world");
};

app
	.route("/leaderboard")
	.all(checkForAPIKey)
	.get(getLeaderboard)
	.post(postLeaderboard)
	.all(notAvailable);

const listloader = async (uri: string) => {
	try {
		console.log(path.resolve(uri));
		const res = await fs.readFile(path.resolve(uri));
		return JSON.parse(res.toString());
	} catch (err) {
		if ((err as Error).message.startsWith("ENOENT")) {
			console.log("File not found, creating new file");
			fs.mkdir(path.resolve("leaderboard_data"), { recursive: true });
			await fs.writeFile(path.resolve(uri), JSON.stringify({}));
			await listloader(uri);
			return;
		}
		console.log("OtherError", err);
	}
};

const setup = async () => {
	scores = await listloader("./leaderboard_data/scores.json");
	console.log("Loaded list: ", scores);
	app.listen(8080);
};

setup();

export const twf = app;
