import axios from 'axios'
import uuidv1 from 'uuid' // search why it is not 'uuid/v1'
import data from '~/static/storedata.json'

export const state = {
	cartUIStatus: 'idle',
	storedata: data,
	cart: []
}

export const getters = {
	featuredProducts: state => state.storedata.slice(0, 3),
	women: state => state.storedata.filter(el => el.gender === 'Female'),
	men: state => state.storedata.filter(el => el.gender === 'Male'),
	cartCount: state => {
		if (!state.cart.lenght) return 0
		return state.cart.reduce((ac, next) => ac + next.quantity, 0)
	},
	cartTotal: state => {
		if (!state.cart.lenght) return 0
		return state.cart.reduce((ac, next) => ac + next.quantity * next.price, 0)
	},
}

export const mutations = {
	updateCartUI: (state, payload) => {
		state.cartUIStatus = payload
	},
	clearCart: state => {
		(state.cart = []), (state.cartUIStatus = 'idle')
	},
	addToCart: (state, payload) => {
		let itemfound = false
		state.cart.forEach(el => {
			if (el.id === payload.id) {
				el.quantity += payload.quantity
				itemfound = true
			}
		})
		if (!itemfound) state.cart.push(payload)
	}
}

export const actions = {
	async postStripeFunction({ getters, commit }, payload) {
		commit('updateCartUI', 'loading')

		try {
			await axios.
				post('https://ecommerce-store-nuxt.netlify.app/.netlify/functions/index', {
					stripeEmail: payload.stripeEmail,
					stripeAmt: Math.floor(getters.cartTotal * 100),
					stripeToken: 'tok_visa',
					stripeIdempotency: uuidv1()
				},
				{
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
			.then(response => {
				if (response.status === 200) {
					commit("updateCartUI", "success")
					setTimeout(() => commit("clearCart"), 3000)
				} else {
					commit("updateCartUI", "failure")
					setTimeout(() => commit("updateCartUI", "idle"), 3000)
				}

				console.log(JSON.stringify(response, null, 2))
			})
		} catch (error) {
			console.log(error)
			commit("updateCartUI", "failure")
		}
	}
}