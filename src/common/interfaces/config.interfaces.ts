export declare interface AppConfigOptions {
	port: number
	host: string
}

export declare interface DatabaseConfigOptions {
	url: string
}

export declare interface JwtConfigOptions {
	accessToken: { key: string; time: string }
	refreshToken: { key: string; time: string }
}
