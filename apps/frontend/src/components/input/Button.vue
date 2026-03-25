<template>
    <button ref="ButtonRef" :default-state="$props.defaultState" :button-type="$props.type"
        @click="(arg) => $emit('click', arg)" :icon-position="$props.iconPosition">
        <span>
            <slot />
        </span>
        <Icon :icon="$props.icon" v-if="$props.icon" :inline="true" />
    </button>

</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue/dist/iconify.js';
import { PropType, ref } from 'vue';

const ButtonRef = ref<HTMLButtonElement | null>(null);

defineProps({
    icon: {
        type: String,
        required: false,
        default: ''
    },
    type: {
        type: String as PropType<"default" | "icon">,
        required: false,
        default: 'default'
    },
    iconPosition: {
        type: String as PropType<'left' | 'right'>,
        required: false,
        default: 'left'
    },
    defaultState: {
        type: String as PropType<'calm' | 'normal' | 'hyper'>,
        required: false,
        default: 'normal'
    }
})

defineEmits(['click']);
defineExpose({ button: ButtonRef });
</script>

<style lang="scss" scoped>
button {
    display: flex;
    align-items: center;
    gap: .5rem;
    border-radius: .35rem;
    transition: .2s ease;
    height: min-content;
    border: 1px solid #e2e2e2;
    border-bottom: 2px solid #e2e2e2;
    background: #fff;
    outline: none;
    cursor: pointer;
    width: fit-content;
    flex-direction: row-reverse;

    padding: .35rem .75rem;

    span {
        opacity: .9;
        transition: .2s ease;
        font-size: 1rem;
    }

    svg {
        opacity: .7;
        transition: .2s ease;
        font-size: 1.25rem;
    }

    &:hover,
    &.hover {
        box-shadow: 0px 4px 10px 0px #00000015;
    }

    &[icon-position='right'] {
        flex-direction: row;
    }

    &[default-state='calm'] {
        border: 1px solid transparent;
        border-bottom: 2px solid transparent;
        background: transparent;

        svg {
            opacity: .7;
        }

        &:hover,
        &.hover {
            border: 1px solid #e2e2e2;
            border-bottom: 2px solid #e2e2e2;
            background: #fff;
            box-shadow: none;

            svg {
                opacity: .9;
            }
        }
    }


    &[button-type="icon"] {
        aspect-ratio: 1/1;

        padding: .35rem;

        span {
            display: none;
        }

        svg {
            font-size: 1.5rem;
        }
    }
}
</style>