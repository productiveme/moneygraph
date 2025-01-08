import { Meteor } from "meteor/meteor"
import { Projections } from "/imports/api/projections"

async function insertProjection({ title, value, cron, parent }) {
	return await Projections.insertAsync({ title, value, cron })
}

Meteor.startup(async () => {
	// If the Links collection is empty, add some data.
	if ((await Projections.find().countAsync()) === 0) {
		await insertProjection({
			title: "Salary",
			value: 2000,
			cron: "0 0 25 * *", // every 25th of the month
		})
		await insertProjection({
			title: "Rent",
			value: -100,
			cron: "0 0 * * 5", // every Friday
		})
		await insertProjection({
			title: "Food",
			value: -50,
			cron: "0 0 * * *", //every day
		})
	}

	// We publish the entire Links collection to all clients.
	// In order to be fetched in real-time to the clients
	Meteor.publish("projections", function () {
		return Projections.find()
	})
})
