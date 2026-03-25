<template>
    <div class="input-group" :icon="$props.icon != undefined" :size="$props.size || 'medium'">
        <div class="inner-group">
            <Icon :icon="$props.icon" v-if="$props.icon" />
            <input :type="$props.type" :placeholder="$props.placeholder" :value="$props.modelValue"
                @input="handleInput">
        </div>
        <span class="error">{{ $props.error }}</span>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
import { PropType, ref } from 'vue';

defineProps({
    icon: {
        required: false,
        type: String
    },
    placeholder: {
        required: false,
        type: String
    },
    type: {
        required: false,
        default: 'text',
        type: String
    },
    size: {
        required: false,
        default: 'medium',
        type: String as PropType<'small' | 'medium' | 'large'>
    },
    modelValue: {
        requied: false,
        default: '',
        type: String
    },
    error: {
        required: false,
        default: undefined,
        type: String
    }
})

const InputRef = ref<HTMLInputElement | null>(null);

defineExpose({ input: InputRef });

const emit = defineEmits(['update:modelValue', 'input']);

function handleInput(e: any) {
    emit('update:modelValue', e.target.value);
    emit('input', e);
}
</script>

<style lang="scss" scoped>
.input-group {
    min-width: 160px;
    max-width: 300px;
    width: 250px;
    display: flex;

    &[size='medium'] {
        input {
            padding: .56rem 1.2rem;
            border-radius: .5rem;
        }

        svg {
            font-size: 1.15rem;
            left: .7rem;
        }

        &[icon="true"] {
            input {
                padding-left: 2.25rem;
            }
        }
    }

    &[size="large"] {
        input {
            font-size: 1.1rem;
            padding: .7rem 1.5rem;
        }

        svg {
            font-size: 1.25rem;
            left: .75rem;
        }

        &[icon="true"] {
            input {
                padding-left: 2.5rem;
            }
        }
    }

    &[icon="true"] {
        input {
            padding-left: 2rem;
        }
    }

    span.error {
        display: block;
        margin: .25rem 0 0 .25rem;
        color: #a16868;
        font-size: .95rem;
    }

    .inner-group {
        position: relative;
    }


    svg {
        position: absolute;
        top: 50%;
        left: .55rem;
        transform: translateY(-50%);
        display: inline-block;
        opacity: .7;
        font-size: 1rem;
        /* margin-top: -1px; */
    }

    input {
        display: flex;
        align-items: center;
        gap: .5rem;
        border-radius: .35rem;
        transition: .2s ease;
        height: min-content;
        border: 1px solid #e2e2e2;
        border-bottom: 2px solid #e2e2e2;
        background: #fff;
        font-size: 1rem;
        padding: .35rem .75rem;
        width: 100%;
        outline: none;

        &::placeholder {
            font-weight: 300;
        }
    }
}
</style>