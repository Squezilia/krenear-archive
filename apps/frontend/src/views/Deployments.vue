<template>
    <h1 v-if="DeploymentsRef.length > 0">Here are all your Deployments! ✨</h1>
    <div class="no-deployments" v-if="DeploymentsRef.length == 0">
        <h1>You have zero deployments 😉</h1>
        <p>Go create some, <RouterLink to='/deployments/create'>go ahead</RouterLink></p>
        <Button icon="solar:forward-bold" icon-position="right" @click="router.push({ path: `/deployments/create` })">
            Create A Deployment
        </Button>
    </div>
    <div class="deployments">
        <RouterLink :to="`/deployment/${deployment.id}/`" @click="SetSelectedDeployment(deployment)" class="deployment" v-for="deployment of DeploymentsRef">
            <div class="head">
                <div class="icon">
                    <figure class="m">
                        <img :src="`/images/${deployment.configuration}.jpg`" alt="app-icon">
                    </figure>
                </div>
                <div class="deployment-name">
                    <span class="name">{{ deployment.name }}</span>
                    <span class="app-name">{{ deployment.configuration }}</span>
                </div>
                <div class="next">
                    <Icon icon="solar:arrow-right-broken" />
                </div>
            </div>
        </RouterLink>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
import router from '../router';
import { ref } from 'vue';
import Deployment from '../types/Deployment';
import { selectedDeploymentStore } from '../pinia';
import Button from '../components/input/Button.vue';
import createProtectedApiInterface from '../api/protected';

const selectedDeployment = selectedDeploymentStore();

const DeploymentsRef = ref<Deployment[]>([]);

const protectedApiInterface = createProtectedApiInterface();

async function GetUserDeployments() {
    const response = await protectedApiInterface({
        method: 'GET',
        url: 'deployment/get',
        params: {
            schemas: ""
        }
    }).catch((error) => {
        if (error.response) router.push({ path: '/' })
    })

    if (!response) return;

    DeploymentsRef.value = response.data as Deployment[];
}

function SetSelectedDeployment(deployment: Deployment) {
    selectedDeployment.update(deployment);
    selectedDeployment.save();
}

GetUserDeployments();

</script>

<style lang="scss" scoped>
.no-deployments {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    p {
        max-width: 800px;
        text-align: center;
        color: #444444;
    }
}

.deployments {
    display: flex;
    flex-wrap: wrap;
    margin-top: 1rem;
    gap: 1rem;

    .deployment {
        display: flex;
        flex-direction: column;
        border: 1px solid #e2e2e2;
        border-radius: 1rem;
        flex: 0 0 32%;
        transition: .2s ease;
        min-width: 200px;

        cursor: pointer;

        color: #000;
        text-decoration: none;

        @media screen and (max-width: 1100px) {
            & {
                flex: 0 0 48.75%;
            }
        }

        @media screen and (max-width: 870px) {
            & {
                flex: 0 0 100%;
            }
        }

        &:hover {
            box-shadow: 0px 4px 10px 0px #00000015;

            .head .next {
                opacity: 1;
            }
        }

        .head {
            display: flex;
            align-items: center;
            gap: .55rem;
            background: #fff;
            padding: 1rem 1rem 1rem 1rem;
            border-bottom: 1px solid #e2e2e2;
            border-radius: 1rem;

            /*             border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
 */
            .deployment-name {
                display: flex;
                flex-direction: column;
                margin-top: -.25rem;

                .app-name {
                    font-size: .85rem;
                    opacity: .7;
                }
            }

            .next {
                margin-left: auto;
                opacity: 0;
                transition: .2s ease;

                svg {
                    font-size: 1.25rem;
                }
            }
        }

        .analytics {
            display: flex;
            gap: .45rem;
            margin: .5rem 1rem 1rem 1rem;

            .charm {
                display: flex;
                align-items: center;
                gap: .25rem;
                border: 1px solid #e2e2e2;
                opacity: .7;
                padding: .45rem .85rem;
                border-radius: .45rem;

                &:first-child {
                    margin-left: auto;
                }

                &:last-child {
                    margin-right: auto;
                }

                span {
                    font-size: .88rem;
                }
            }
        }
    }
}
</style>