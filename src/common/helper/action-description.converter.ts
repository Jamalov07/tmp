const ACTION_DESCRIPTIONS = {
	//staff
	'staff/many-findMany-get': `Xodimlarning to'liq ro'yxatini olish`,
	'staff/one-findOne-get': `Bitta xodimni olish`,
	'staff/one-createOne-post': `Yangi xodim yaratish`,
	'staff/one-updateOne-patch': `Xodimni yangilash`,
	'staff/one-deleteOne-delete': `Xodimni o'chirish`,

	//action
	'action/many-findMany-get': `Harakatlar ro'yxatini olish`,
	'action/one-findOne-get': `Bitta harakatni olish`,
	'action/one-updateOne-patch': `Harakatni yangilash`,

	//partner
	'partner/many-findMany-get': `Hamkorlar ro'yhatini olish`,
	'partner/one-getOne-get': 'Bitta hamkorni olish',
	'partner/one-createOne-post': 'Yangi hamkor yaratish',
	'partner/one-updateOne-patch': 'Hamkorni yangilash',
	'partner/one-deleteOne-delete': 'Hamkorni o`chirish',

	//staff-role
	'staff-role/many-findMany-get': `Xodim rollari ro'yxatini olish`,
	'staff-role/one-getOne-get': `Bitta xodim rolini olish`,
	'staff-role/one-updateOne-patch': `Xodim rolini yangilash`,

	//partner-role
	'partner-role/many-findMany-get': `Hamkor rollari ro'yxatini olish`,
	'partner-role/one-getOne-get': `Bitta hamkor rolini olish`,
	'partner-role/one-updateOne-patch': `Hamkor rolini yangilash`,

	//furniture-type
	'furniture-type/many-findMany-get': `Mebel turlari ro'yxatini olish`,
	'furniture-type/one-findOne-get': `Bitta mebel turini olish`,
	'furniture-type/one-createOne-post': `Yangi mebel turi yaratish`,
	'furniture-type/one-updateOne-patch': `Mebel turini yangilash`,
	'furniture-type/one-deleteOne-delete': `Mebel turini o'chirish`,

	//model
	'model/many-findMany-get': `Modellar ro'yxatini olish`,
	'model/one-findOne-get': `Bitta modelni olish`,
	'model/one-createOne-post': `Yangi model yaratish`,
	'model/one-updateOne-patch': `Modelni yangilash`,
	'model/one-deleteOne-delete': `Modelni o'chirish`,
}

export function actionDescriptionConverter(action: string): string {
	return ACTION_DESCRIPTIONS[action] ?? `Noma'lum harakat`
}
