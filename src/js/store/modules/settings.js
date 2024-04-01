/* jshint esversion: 6 */
/**
 * @copyright Copyright (c) 2020 Rene Gieling <github@dartcafe.de>
 *
 * @author Rene Gieling <github@dartcafe.de>
 *
 * @license  AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { CalendarAPI, UserSettingsAPI } from '../../Api/index.js'

const defaultSettings = () => ({
	user: {
		useCommentsAlternativeStyling: false,
		useAlternativeStyling: false,
		calendarPeek: false,
		checkCalendars: [],
		checkCalendarsBefore: 0,
		checkCalendarsAfter: 0,
		defaultViewTextPoll: 'table-view',
		defaultViewDatePoll: 'table-view',
		performanceThreshold: 1000,
		pollCombo: [],
		relevantOffset: 30,
	},
	session: {
		manualViewDatePoll: '',
		manualViewTextPoll: '',
	},
	availableCalendars: [],
	viewModes: [
		'list-view',
		'table-view',
	],
})

const namespaced = true
const state = defaultSettings()

const mutations = {
	/**
	 * @param {object} state
	 */
	reset(state) {
		Object.assign(state, defaultSettings())
	},

	setPreference(state, payload) {
		Object.keys(payload).filter((key) => key in state.user).forEach((key) => {
			state.user[key] = payload[key]
		})
	},

	/**
	 * @param {object} state state
	 * @param {object} payload payload
	 */
	setCalendars(state, payload) {
		state.availableCalendars = payload.calendars
	},

	/**
	 * @param {object} state state
	 * @param {object} payload payload
	 */
	addCheckCalendar(state, payload) {
		state.user.checkCalendars.push(payload.calendar.key)
	},

	/**
	 * @param {object} state state
	 * @param {object} payload payload
	 */
	setPollCombo(state, payload) {
		state.user.pollCombo = payload.pollCombo
	},

	/**
	 * @param {object} state state
	 * @param {object} payload payload
	 */
	setViewDatePoll(state, payload) {
		state.session.manualViewDatePoll = payload
	},
	/**
	 * @param {object} state state
	 * @param {object} payload payload
	 */
	setViewTextPoll(state, payload) {
		state.session.manualViewTextPoll = payload
	},
}

const getters = {
	/**
	 * @param {object} state state
	 */
	viewTextPoll(state) {
		if (state.session.manualViewTextPoll) {
			return state.session.manualViewTextPoll
		}
		if (window.innerWidth > 480) {
			return state.user.defaultViewTextPoll
		}
		return 'list-view'

	},

	/**
	 * @param {object} state state
	 */
	viewDatePoll(state) {
		if (state.session.manualViewDatePoll) {
			return state.session.manualViewDatePoll
		}
		if (window.innerWidth > 480) {
			return state.user.defaultViewDatePoll
		}
		return 'list-view'

	},
}

const actions = {
	/**
	 * @param {object} context state context
	 */
	async get(context) {
		try {
			const response = await UserSettingsAPI.getUserSettings()
			context.commit('setPreference', response.data.preferences)
		} catch (e) {
			if (e?.code === 'ERR_CANCELED') return
			context.commit('reset')
			throw e
		}
	},

	/**
	 * @param {object} context state context
	 * @param {object} payload payload
	 */
	async setPollCombo(context, payload) {
		await context.commit('setPollCombo', {
			pollCombo: payload.pollCombo,
		})
		context.dispatch('write')
	},

	/**
	 * @param {object} context state context
	 */
	async write(context) {
		try {
			const response = await UserSettingsAPI.writeUserSettings(context.state.user)
			context.commit('setPreference', response.data.preferences)
		} catch (e) {
			if (e?.code === 'ERR_CANCELED') return
			console.error('Error writing preferences', { error: e.response }, { preferences: state.user })
			throw e
		}
	},

	/**
	 * @param {object} context state context
	 */
	async getCalendars(context) {
		try {
			const response = await CalendarAPI.getCalendars()
			context.commit('setCalendars', { calendars: response.data.calendars })
			return response
		} catch (e) {
			if (e?.code === 'ERR_CANCELED') return
			throw e
		}
	},
}

export default { namespaced, state, mutations, getters, actions }
