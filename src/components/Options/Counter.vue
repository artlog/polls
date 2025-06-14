<!--
  - SPDX-FileCopyrightText: 2018 Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import ParticipantIcon from 'vue-material-design-icons/Account.vue'
import YesCounterIcon from 'vue-material-design-icons/AccountCheck.vue'
import MaybeCounterIcon from 'vue-material-design-icons/AccountCheckOutline.vue'
import { Option } from '../../Types/index.ts'
import { n, t } from '@nextcloud/l10n'
import { usePreferencesStore } from '../../stores/preferences.ts'
import { computed } from 'vue'

const preferencesStore = usePreferencesStore()

interface Props {
	option: Option
	showMaybe?: boolean
}

const titleYesVotes = computed(() => {
	return n('polls', '%n yes vote', '%n yes votes', option.votes.yes)
})

const titleMaybeVotes = computed(() => {
	return n('polls', '%n maybe vote', '%n maybe votes', option.votes.maybe)
})

const combinedTitle = computed(() => {
	if (showMaybe && option.votes.maybe) {
		return `${titleYesVotes.value} ${t('polls', 'and')} ${titleMaybeVotes.value}`
	}
	return titleYesVotes.value
})

const { option, showMaybe = false } = defineProps<Props>()
</script>

<template>
	<div
		v-if="preferencesStore.user.useCounterAlternativeStyling"
		:title="combinedTitle"
		class="counter alternative">
		<ParticipantIcon :size="20" />

		<div class="yes">
			<span>{{ option.votes.yes }}</span>
		</div>

		<div v-if="showMaybe && option.votes.maybe" class="maybe">
			<span>{{ `(+${option.votes.maybe})` }}</span>
		</div>
	</div>

	<div v-else class="counter">
		<div class="yes">
			<YesCounterIcon
				fill-color="var(--color-polls-foreground-yes)"
				:size="20" />
			<span>{{ option.votes.yes }}</span>
		</div>

		<div v-show="showMaybe" class="maybe">
			<MaybeCounterIcon
				fill-color="var(--color-polls-foreground-maybe)"
				:size="20" />
			<span>{{ option.votes.maybe }}</span>
		</div>
	</div>
</template>

<style lang="scss">
.counter {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.25rem 1rem;
	padding: 0 0.75rem;
	font-size: 1.1em;

	&.alternative {
		gap: 0.25rem;
	}

	div {
		display: flex;
		align-items: center;
		justify-content: space-around;
	}

	.yes {
		color: var(--color-polls-foreground-yes);
	}

	.no {
		color: var(--color-polls-foreground-no);
	}

	.maybe {
		color: var(--color-polls-foreground-maybe);
	}
}
</style>
