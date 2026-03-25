<template>
    <div class="backdrop" :active="modelValue">
        <div class="popup">
            <div class="popup-head">
                <div class="title">
                    {{ title }}
                </div>
                <div class="controls">
                    <button @click="$emit('update:modelValue', false)">
                        <Icon icon="material-symbols:close-rounded" />
                    </button>
                </div>
            </div>

            <div class="popup-content">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';

defineProps({
    title: {
        required: true,
        type: String
    },
    modelValue: {
        required: true,
        type: Boolean
    }
})

const emit = defineEmits(['update:modelValue', 'input']);
</script>


<style lang="scss" scoped>
.backdrop {
    display: none;
    place-items: center;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    z-index: 200;

    background: #0000005c;

    &[active="true"] {
        display: grid;
    }

    .popup {
        // background: #fafafa;
        border-radius: 1rem;
        border: 1px solid #bababa;
        display: flex;
        min-width: 500px;
        overflow: hidden;

        flex-direction: column;

        @media screen and (max-width: 550px) {
            & {
                width: 100%;
                height: 100%;
                border-radius: 0;
            }
        }

        .popup-content {
            background: #f8f8f8;
            border-bottom-left-radius: 1rem;
            border-bottom-right-radius: 1rem;
        }


        .popup-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            position: relative;
            padding: 1rem;
            border-bottom: 1px solid #bababa;
            background: #fff;
            border-top-left-radius: 1rem;
            ;
            border-top-right-radius: 1rem;

            .controls {

                button {
                    border: none;

                    aspect-ratio: 1/1;

                    border-radius: .5rem;

                    display: grid;
                    place-items: center;

                    border: 1px solid #bababa;
                    padding: .5rem;

                    cursor: pointer;

                    transition: .2s ease;

                    &:hover {
                        box-shadow: 0px 4px 10px 0px #00000015;
                    }
                }
            }

            .title {
                font-weight: 500;
            }
        }
    }
}
</style>