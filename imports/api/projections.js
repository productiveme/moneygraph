import { Mongo } from "meteor/mongo"
import { Meteor } from "meteor/meteor"
import { check } from "meteor/check"

export const Projections = new Mongo.Collection("projections")

Meteor.methods({
	async "projections/insert"({ title, value, cron, createdAt }) {
		check(title, String)
		check(value, Number)
		check(cron, String)
		return await Projections.insertAsync({
			title,
			value,
			cron,
			createdAt: createdAt ?? new Date(),
		})
	},
	async "projections/remove"(_id) {
		check(_id, String)
		return await Projections.removeAsync({ _id })
	},
	async "projections/clear"() {
		return await Projections.removeAsync({})
	},
})
