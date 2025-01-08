import { makeProjection, makeProjectionList } from "../../domain/entities/projection.js"
import crypto from "crypto"

export const makeMongooseProjectionsRepository = ({ ProjectionModel }) => {
	const generateHash = (data) => {
		// Create a deterministic string representation of the data
		const stringToHash = `${data.title}-${data.value}-${data.cron}`
		return crypto.createHash("sha256").update(stringToHash).digest("hex")
	}
	const modelToEntity = (model) => {
		if (!model) return null

		// Ensure we have a valid _id before converting
		const id = model._id ? model._id.toString() : null
		if (!id) {
			console.warn("Skipping invalid model - missing _id:", model)
			return null
		}

		return makeProjection({
			id,
			title: model.title,
			value: model.value,
			cron: model.cron,
			createdAt: model.createdAt,
		})
	}

	const add = async (projectionData) => {
		try {
			const projection = makeProjection(projectionData)
			const model = new ProjectionModel(projection.serialize())
			const saved = await model.save()
			if (!saved) {
				throw new Error("Failed to save projection")
			}
			return modelToEntity(saved)
		} catch (error) {
			console.error("Error adding projection:", error)
			throw error
		}
	}

	const remove = async (id) => {
		await ProjectionModel.findByIdAndDelete(id)
		return true
	}

	const getAll = async () => {
		try {
			const models = await ProjectionModel.find({})
				.select("_id title value cron createdAt")
				.sort({ createdAt: 1 })
				.exec()

			if (!Array.isArray(models)) {
				console.warn("No models found or invalid response from database")
				return makeProjectionList([])
			}

			const projections = models.map(modelToEntity).filter(Boolean) // Remove any null results from modelToEntity

			return makeProjectionList(projections)
		} catch (error) {
			console.error("Error getting all projections:", error)
			return makeProjectionList([]) // Return empty list instead of throwing
		}
	}

	const clear = async () => {
		await ProjectionModel.deleteMany({})
		return true
	}

	const importMany = async (projectionsData) => {
		try {
			const projections = projectionsData.map((data) => makeProjection(data))
			const serializedData = projections.map((p) => p.serialize())

			// Process each document to ensure it has an _id
			const processedData = serializedData.map((data) => {
				// If no id is present, generate one using hash
				if (!data.id) {
					return {
						...data,
						_id: generateHash(data),
					}
				}
				// If id exists, keep it
				return {
					...data,
					_id: data.id,
				}
			})

			// Use ordered: false to continue processing even if some documents fail
			const models = await ProjectionModel.insertMany(processedData, {
				lean: false,
				ordered: false,
			})

			if (!Array.isArray(models)) {
				throw new Error("Expected array of models from insertMany")
			}

			return models.map(modelToEntity).filter(Boolean)
		} catch (error) {
			// Handle bulk write errors (some documents might have been inserted)
			if (error.name === "BulkWriteError") {
				console.warn("Some documents failed to import:", error.writeErrors)
				// Return the successfully inserted documents
				const insertedDocs = await ProjectionModel.find({
					_id: { $in: error.insertedDocs.map((doc) => doc._id) },
				})
				return insertedDocs.map(modelToEntity).filter(Boolean)
			}

			console.error("Error importing projections:", error)
			throw error
		}
	}

	return Object.freeze({
		add,
		remove,
		getAll,
		clear,
		importMany,
	})
}
