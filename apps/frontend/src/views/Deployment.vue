<template>
    <div class="deployment-meta">
        <div class="deployment-image">
            <figure class="l">
                <img :src="`/images/${selectedDeployment.configuration}.jpg`" alt="app-image">
            </figure>
        </div>
        <div class="deployment-name">
            <h3 class="name">{{ selectedDeployment.name }}</h3>
            <h5 class="app">{{ selectedDeployment.configuration }}</h5>
        </div>
        <div class="deployment-controls">
            <Dropdown :items="DeploymentDropdownItems" />
        </div>
    </div>
    <div class="production">
        <div class="production-status-icon">
            <Icon :icon="HelperIcon" shape-rendering="geometricPrecision" />
        </div>
        <div class="production-status-details">
            <span class="title">{{ HelperTitle }}</span>
            <span class="production-link">{{ HelperDescription }}</span>
        </div>
        <div class="production-controls">
            <Button icon="solar:forward-bold" icon-position="right" v-if="selectedDeployment.domains.length == 0"
                @click="router.push({ path: `/deployment/${router.currentRoute.value.params.deploymentId}/domains` })">
                Open Domains
            </Button>
            <Button icon="solar:forward-bold" icon-position="right" v-else
                @click="router.push({ path: `/deployment/${router.currentRoute.value.params.deploymentId}/domains` })">
                Share Deployment
            </Button>
        </div>
    </div>
    <div class="blocks">
        <div class="block">
            <div class="head">
                <Icon icon="solar:eye-bold-duotone" />
                <span>Monthly Views</span>
            </div>
            <div class="count">
                Unavailable
            </div>
        </div>
        <div class="block">
            <div class="head">
                <Icon icon="solar:eye-bold" />
                <span>Total Views</span>
            </div>
            <div class="count">
                Unavailable
            </div>
        </div>
        <div class="block">
            <div class="head">
                <Icon icon="solar:key-minimalistic-bold" />
                <span>Records</span>
            </div>
            <div class="count">
                Unavailable
            </div>
        </div>
        <RouterLink :to="`/deployment/${router.currentRoute.value.params.deploymentId}/analytics`" class="block action">
            <div class="head">
                <Icon icon="solar:chart-square-bold" />
                <span>More Details</span>
            </div>
            <div class="count">
                Open Analytics
                <Icon icon="solar:forward-bold" :inline="true" />
            </div>
        </RouterLink>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
import router from '../router';
import Button from '../components/input/Button.vue';
import { ref } from 'vue';
import { selectedDeploymentStore } from '../pinia';
import { Item } from '../types/Dropdown';
import Dropdown from '../components/input/Dropdown.vue';

const selectedDeployment = selectedDeploymentStore();

const HelperIcon = ref<string>('');
const HelperTitle = ref<string>('');
const HelperDescription = ref<string>('');

const DeploymentDropdownItems = ref<Item[]>([
    {
        title: "Copy Deployment ID",
        icon: "solar:programming-bold",
        action() {
            navigator.clipboard.writeText(selectedDeployment.id);
        },
    }
])

function FillHelper() {
    if (selectedDeployment.domains.length == 0) {
        HelperIcon.value = "solar:shield-warning-bold";
        HelperTitle.value = "Did you forgot something?";
        HelperDescription.value = "Add a custom domain for your deployment.";
        return;
    }
    HelperIcon.value = "solar:check-circle-bold";
    HelperTitle.value = "You're all set!";
    HelperDescription.value = "You're ready to catch some nerds.";
}

FillHelper();
</script>

<style lang="scss" scoped>
.deployment-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    /* max-width: 900px; */
    margin: 1rem auto 2rem auto;

    .deployment-name {
        display: flex;
        flex-direction: column;
        gap: .25rem;

        .app {
            opacity: .7;
        }
    }

    .deployment-controls {
        margin-left: auto;


        button {
            position: relative;
        }
    }
}

.production {
    padding: 1rem;
    border: 1px solid #bebebe;
    border-radius: 1rem;
    display: flex;
    align-items: center;

    gap: .5rem;

    max-width: 1000px;
    margin: 1rem auto 0 auto;

    .production-status-icon {
        svg {
            font-size: 3rem;
            opacity: .8;

            display: flex;
        }
    }

    .production-status-details {
        display: flex;
        flex-direction: column;
        gap: .25rem;

        .title {
            font-size: 1.25rem;
        }

        .production-link {
            font-size: .85rem;
            color: #444444;
        }
    }

    .production-controls {
        margin-left: auto;
    }
}

.blocks {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    margin-top: 1rem;
    /* max-width: 1000px; */
    margin: 1rem auto 0 auto;

    .block {
        display: flex;
        flex-direction: column;
        aspect-ratio: 4/1;
        width: 50%;
        flex: 0 0 49%;
        border: 1px solid #bebebe;
        border-radius: 1rem;
        padding: 1rem;
        color: #000;
        text-decoration: none;
        transition: .2s ease;

        &.action {
            background: #141414;
            color: #fff;

            .head {
                opacity: 1;
                color: #bebebe;
            }

            &:hover {
                background: #fff;
                color: #000;
                box-shadow: 0px 4px 10px 0px #00000015;

                .head {
                    color: #141414;
                }

                .count {
                    svg {
                        margin-left: .55rem;
                    }
                }
            }
        }

        @media screen and (max-width: 1250px) {
            & {
                flex: 0 0 100%;
                aspect-ratio: 8/1;
            }
        }

        .head {
            opacity: .85;
            display: flex;
            align-items: center;
            gap: .45rem;
            margin-bottom: 1rem;

            svg {
                font-size: 1.25rem;
            }

            span {
                font-size: 1rem;
            }
        }

        .count {
            margin-top: auto;
            font-size: 2rem;

            svg {
                transition: .2s ease margin;
            }
        }
    }
}
</style>