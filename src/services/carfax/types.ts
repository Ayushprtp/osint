interface CarfaxVehicleBase {
	vin: string
	year?: string
	make?: string
	model?: string
	plate?: string
	state?: string
	color?: string
	trim?: string
	style?: string
	vehicleUse?: string
}

interface CarfaxVehicleResponse {
	status: string
	vehicles: CarfaxVehicleBase[]
}

interface ServiceRecord {
	date: string
	mileage: string
	services: string[]
}

interface OwnershipRecord {
	owner_number: number
	type: string
	location: string
	last_reported_odometer: string
}

interface CarfaxVehicleHistoryData {
	vehicle: {
		vin: string
		year?: string
		make?: string
		model?: string
		last_reported_odometer?: string
		title?: string
	}
	highlights?: string[]
	ownership_history?: OwnershipRecord[]
	service_history?: ServiceRecord[]
}

interface CarfaxVehicleHistoryResponse {
	status: string
	data: CarfaxVehicleHistoryData
}

interface ErrorResponse {
	status: string
	message: string
}

export type {
	CarfaxVehicleBase,
	CarfaxVehicleResponse,
	CarfaxVehicleHistoryResponse,
	CarfaxVehicleHistoryData,
	ServiceRecord,
	OwnershipRecord,
	ErrorResponse,
}
