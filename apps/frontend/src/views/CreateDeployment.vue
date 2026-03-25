<template>
    <Popup :title="PopupTitle" v-model="PopupVisibility">
        <p>{{ PopupMessage }}</p>
    </Popup>

    <h1>A new Deployment 🔥</h1>
    <div class="container">
        <div class="meta-image">
            <div class="presets">
                <div class="icon">
                    <Icon icon="solar:folder-open-bold" />
                </div>
                <div class="seperator">
                    <div class="star"></div>
                </div>
                <p>These are the presets you can choose for your deployment.</p>
            </div>
        </div>
        <div class="creation">
            <div class="presets">
                <div class="preset" v-for="preset of Presets" :configuration="preset.id" @click="CreateDeployment(preset.id)">
                    <div class="preset-image">
                        <figure class="m">
                            <img :src="`/images/${preset.id}.jpg`" alt="Preset Image">
                        </figure>
                    </div>
                    <div class="preset-details">
                        <div class="preset-name">
                            <span class="name">
                                {{ preset.name }}
                            </span>
                            <span class="purpose">
                                {{ preset.purpose }}
                            </span>
                        </div>
                        <div class="preset-tags">
                            <div class="tag" v-for="tag of preset.tags">{{ tag }}</div>
                        </div>
                    </div>
                    <div class="next">
                        <Icon icon="solar:arrow-right-broken" class="arrow" />
                        <Icon icon="ri:loader-5-line" class="loader" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
import defaultApiInterface from '../api/default';

import type Config from '../types/Config';
import { ref } from 'vue';

import router from '../router';
import { selectedDeploymentStore } from '../pinia';
import createProtectedApiInterface from '../api/protected';
import workerIntervalPromise from '../api/workerIntervalPromise';

import Popup from '../components/view/Popup.vue';

const Presets = ref<Config[]>([]);

const selectedDeployment = selectedDeploymentStore();

const protectedApiInterface = createProtectedApiInterface();
const isCreating = ref<boolean>(false);

const PopupVisibility = ref<boolean>(false);
const PopupTitle = ref<string>("");
const PopupMessage = ref<string>("");

async function GetAvailablePresets() {
    const apiInfo = await defaultApiInterface({
        method: 'GET',
        url: '/'
    })

    if (apiInfo.data) Presets.value = apiInfo.data.configs;
}

async function CreateDeployment(configuration: string) {
    if (isCreating.value) return;
    document.querySelectorAll('.container .creation .presets .preset').forEach((element) => {
        element.getAttribute('configuration') == configuration ? element.classList.add('loading') : element.classList.add('disabled')
    });
    isCreating.value = true;

    const deploymentCreatingWorker = await protectedApiInterface({
        method: 'POST',
        url: 'deployment/create',
        data: {
            configuration
        }
    }).catch((err) => {
        if (err.response) {
            PopupTitle.value = err.response.data.error;
            PopupMessage.value = err.response.data.reason;
            PopupVisibility.value = true;
            isCreating.value = false;
            document.querySelectorAll('.container .creation .presets .preset').forEach((element) => {
                element.getAttribute('configuration') == configuration ? element.classList.remove('loading') : element.classList.remove('disabled')
            });
            return;
        }
        alert("Something went wrong, please try again later.");
    })

    if (!deploymentCreatingWorker) return;

    const workerResult = await workerIntervalPromise(deploymentCreatingWorker.data.workerId);

    const createdDeployment = await protectedApiInterface({
        method: 'GET',
        url: 'deployment/get',
        params: {
            deploymentId: workerResult.deploymentId
        }
    });

    selectedDeployment.update(createdDeployment.data[0]);
    selectedDeployment.save();

    if (workerResult.status == 'success') router.push({ path: `/deployment/${workerResult.deploymentId}/` })
    else alert('Something went wrong, please try again later');
}

GetAvailablePresets();
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    flex-wrap: wrap;
    min-height: 600px;
    height: 600px;
    margin-top: 1rem;
    gap: 1rem;

    .meta-image {
        background: #222;
        padding: 1rem;
        flex: 0 0 32%;
        height: 100%;
        border-radius: 1rem;
        background: linear-gradient(135deg, #424242 0%, #101010 100%);
        position: relative;
        z-index: 0;

        @media screen and (max-width: 1100px) {
            & {
                flex: 0 0 100%;
                height: 30%;
            }
        }

        &::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: calc(100% - 4px);
            height: calc(100% - 4px);
            background: linear-gradient(135deg, #252525 0%, #161616 100%);
            border-radius: 1rem;
            z-index: 1;
        }

        .presets,
        .options {
            position: relative;
            z-index: 10;
            color: #bababa;
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: center;
            height: 100%;

            .icon {
                svg {
                    font-size: 3rem;
                }
            }

            .seperator {
                width: 60%;
                height: 1px;
                background: #bababa;
                margin: 1rem;
                position: relative;

                &::before {
                    content: '';
                    position: absolute;
                    width: 2rem;
                    height: 1rem;
                    background: #1e1e1e;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .star {
                    position: relative;
                }

                .star::after,
                .star::before {
                    position: absolute;
                    content: "\2726";
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 1.25rem;
                    margin-top: -.1rem;
                }

                .star::after {
                    /* The foreground star */
                    background: #bababa;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            }

            p {
                font-weight: 500;
                text-align: center;
                word-spacing: .200rem;
                line-height: 1.25rem;
                max-width: 90%;
            }
        }
    }

    .creation {
        border: 1px solid #cecece;
        padding: 1rem;
        flex: 0 0 66%;
        height: 100%;
        border-radius: 1rem;

        @media screen and (max-width: 1100px) {
            & {
                flex: 0 0 100%;
            }
        }

        .presets {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            overflow: auto;

            .preset {
                display: flex;
                gap: 1rem;
                padding: .75rem 1rem;
                align-items: center;
                border-radius: 1rem;
                aspect-ratio: 8/2;
                flex: 0 0 47%;
                width: 100%;
                height: auto;
                border: 1px solid #e2e2e2;
                border-bottom: 2px solid #e2e2e2;
                background: #fff;

                transition: .2s ease;

                &.disabled {
                    filter: blur(8px);
                }

                &.loading {
                    cursor: not-allowed;

                    .next {
                        .arrow {
                            display: none;
                        }

                        .loader {
                            display: block;
                        }
                    }
                }

                &:hover {
                    box-shadow: 0px 4px 10px 0px #00000015;

                    .next .arrow {
                        opacity: 1;
                    }
                }

                @media screen and (max-width: 1600px) {
                    & {
                        flex: 0 0 48.75%;
                        max-width: 48.75%;
                    }
                }

                @media screen and (max-width: 1288px) {
                    & {
                        flex: 0 0 48%;
                        max-width: 48%;
                    }
                }

                @media screen and (max-width: 820px) {
                    & {
                        flex: 0 0 100%;
                        max-width: 100%;
                    }
                }

                .preset-image {
                    .icon {
                        width: 4rem;
                        height: 4rem;
                        display: grid;
                        place-items: center;
                        background: #1e1e1e;
                        border-radius: .5rem;

                        svg {
                            font-size: 2rem;
                            color: #bababa;
                        }
                    }
                }

                .preset-details {
                    display: flex;
                    flex-direction: column;

                    .preset-name {
                        display: flex;
                        flex-direction: column;
                        text-transform: capitalize;

                        span.purpose {
                            font-size: .75rem;
                        }
                    }

                    .preset-tags {
                        display: flex;
                        margin-top: .5rem;
                        gap: .25rem;
                        flex-wrap: wrap;

                        .tag {
                            font-size: .85rem;
                            border-radius: .25rem;
                            padding: .125rem .5rem;
                            color: #505050;
                            border: 1px solid #505050;
                        }
                    }
                }

                .next {
                    margin-left: auto;
                    transition: .2s ease;

                    .arrow {
                        opacity: 0;
                    }

                    .loader {
                        display: none;
                        animation: loader .5s infinite;
                        animation-timing-function: linear;
                    }

                    svg {
                        transition: .2s ease;
                        font-size: 1.25rem;
                    }
                }
            }
        }
    }
}

.popup {
    p {
        padding: 1rem;
    }
}

@keyframes loader {
    from {
        transform: rotate(0deg)
    }

    to {
        transform: rotate(360deg);
    }
}
</style>