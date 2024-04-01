/* jshint esversion: 6 */
/**
 * @copyright Copyright (c) 2019 René Gieling <github@dartcafe.de>
 *
 * @author René Gieling <github@dartcafe.de>
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
import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from '@nextcloud/auth'
import { generateUrl } from '@nextcloud/router'
import { getCookieValue, setCookie } from './helpers/cookieHelper.js'
import { PublicAPI } from './Api/public.js'
import { defineAsyncComponent } from 'vue'

// Dynamic loading
const List = defineAsyncComponent(() => import('./views/PollList.vue'))
const Administration = defineAsyncComponent(() => import('./views/Administration.vue'))
const Vote = defineAsyncComponent(() => import('./views/Vote.vue'))
const NotFound = defineAsyncComponent(() => import('./views/NotFound.vue'))
const SideBar = defineAsyncComponent(() => import('./views/SideBar.vue'))
const SideBarCombo = defineAsyncComponent(() => import('./views/SideBarCombo.vue'))
const Navigation = defineAsyncComponent(() => import('./views/Navigation.vue'))
const Combo = defineAsyncComponent(() => import('./views/Combo.vue'))

/**
 * @callback nextCallback
 * @param {object} route
 */

/**
 * @param {object} to Target route
 * @param {object} from  Route navigated from
 * @param {nextCallback} next callback for next route
 */
async function validateToken(to, from, next) {
	try {
		const response = await PublicAPI.getShare(to.params.token)
		if (getCurrentUser()) {
			// reroute to the internal vote page, if the user is logged in
			next({ name: 'vote', params: { id: response.data.share.pollId } })

		} else {

			const privateToken = getCookieValue(to.params.token)

			if (privateToken && privateToken !== to.params.token) {
				// extend expiry time for 30 days after successful access
				const cookieExpiration = (30 * 24 * 60 * 1000)
				setCookie(to.params.token, privateToken, cookieExpiration)
				next({ name: 'publicVote', params: { token: privateToken } })
			} else {
				next()
			}
		}
	} catch (e) {
		if (getCurrentUser()) {
			next({ name: 'notfound' })
		} else {
			window.location.replace(generateUrl('login'))
		}

	}
}

const router = createRouter({
	history: createWebHistory('/apps/polls'),
	linkActiveClass: 'active',
	routes: [
		{
			path: '/',
			redirect: {
				name: 'list',
				params: {
					type: 'relevant',
				},
			},
		},
		{
			path: '/list',
			redirect: {
				name: 'list',
				params: {
					type: 'relevant',
				},
			},
		},
		{
			path: '/list/:type?',
			components: {
				default: List,
				navigation: Navigation,
			},
			props: true,
			name: 'list',
		},
		{
			path: '/administration',
			components: {
				default: Administration,
				navigation: Navigation,
			},
			name: 'administration',
		},
		{
			path: '/combo',
			components: {
				default: Combo,
				navigation: Navigation,
				sidebar: SideBarCombo,
			},
			name: 'combo',
		},
		{
			path: '/not-found',
			components: {
				default: NotFound,
				navigation: Navigation,
			},
			name: 'notfound',
		},
		{
			path: '/vote/:id',
			components: {
				default: Vote,
				navigation: Navigation,
				sidebar: SideBar,
			},
			props: true,
			name: 'vote',
		},
		{
			path: '/s/:token',
			components: {
				default: Vote,
				sidebar: SideBar,
			},
			beforeEnter: validateToken,
			props: true,
			name: 'publicVote',
		},
	],
})

export default router
