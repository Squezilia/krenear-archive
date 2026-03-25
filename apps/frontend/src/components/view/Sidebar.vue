<template>
    <aside class="sidebar" :mode="GetSidebarMode(router.currentRoute.value.path)">
        <div class="head">
            <div class="default">
                <div class="logo">
                    K
                </div>
                <div class="appname">
                    <span>
                        Krenear
                        <div class="beta">BETA</div>
                    </span>
                </div>
            </div>
            <div class="deployment">
                <button class="back" @click="router.push({ path: '/deployments' })">
                    <Icon icon="solar:alt-arrow-left-linear" />
                </button>
                <div class="app-icon">
                    <figure class="xs">
                        <img class="xs" :src="`/images/${selectedDeployment.configuration}.jpg`" alt="App Icon">
                    </figure>
                </div>
                <div class="appname">
                    <span class="name">
                        {{ selectedDeployment.name }}
                    </span>
                    <span class="app">
                        {{ selectedDeployment.configuration }}
                    </span>
                </div>
            </div>
        </div>
        <div class="body">
            <div class="default">
                <RouterLink to="/" class="route" :active="router.currentRoute.value.path == '/'">
                    <Icon icon="solar:home-angle-bold" />
                    <span>Home</span>
                </RouterLink>
                <RouterLink to="/deployments" class="route" :active="router.currentRoute.value.path == '/deployments'">
                    <Icon icon="solar:folder-bold" />
                    <span>Deployments</span>
                </RouterLink>
                <RouterLink to="/deployments/create" class="route"
                    :active="router.currentRoute.value.path == '/deployments/create'">
                    <Icon icon="solar:add-folder-bold" />
                    <span>Create Deployment</span>
                </RouterLink>
            </div>
            <div class="deployment">
                <RouterLink :to="`/deployment/${router.currentRoute.value.params.deploymentId}/`" class="route"
                    :active="router.currentRoute.value.path.startsWith('/deployment') && router.currentRoute.value.path.endsWith('/')">
                    <Icon icon="solar:widget-4-bold" />
                    <span>Dashboard</span>
                </RouterLink>
                <RouterLink :to="`/deployment/${router.currentRoute.value.params.deploymentId}/records`" class="route"
                    :active="router.currentRoute.value.path.startsWith('/deployment') && router.currentRoute.value.path.endsWith('/records')">
                    <Icon icon="solar:key-minimalistic-bold" />
                    <span>Records</span>
                </RouterLink>
                <RouterLink :to="`/deployment/${router.currentRoute.value.params.deploymentId}/domains`" class="route"
                    :active="router.currentRoute.value.path.startsWith('/deployment') && router.currentRoute.value.path.endsWith('/domains')">
                    <Icon icon="solar:global-bold" />
                    <span>Domains</span>
                </RouterLink>
                <RouterLink :to="`/deployment/${router.currentRoute.value.params.deploymentId}/analytics`" class="route"
                    :active="router.currentRoute.value.path.startsWith('/deployment') && router.currentRoute.value.path.endsWith('/analytics')">
                    <Icon icon="solar:chart-square-bold" />
                    <span>Analytics</span>
                </RouterLink>
                <RouterLink :to="`/deployment/${router.currentRoute.value.params.deploymentId}/settings`" class="route"
                    :active="router.currentRoute.value.path.startsWith('/deployment') && router.currentRoute.value.path.endsWith('/settings')">
                    <Icon icon="solar:settings-minimalistic-bold" />
                    <span>Settings</span>
                </RouterLink>
            </div>
        </div>
        <div class="bottom">
            <div class="user">
                <div class="icon">
                    <Icon icon="fluent:person-16-filled" />
                </div>
                <div class="meta">
                    <span class="username">{{ user.username }}</span>
                    <span class="role">{{ user.subscription.levels[0] }}</span>
                </div>
                <div class="dropdown">
                    <Dropdown :items="UserDropdownItems" position="up" />
                </div>
            </div>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
import router from '../../router';
import { ref } from 'vue';
import { selectedDeploymentStore, userStore } from '../../pinia';
import Dropdown from '../input/Dropdown.vue';
import { Item } from '../../types/Dropdown';

const user = userStore();
const selectedDeployment = selectedDeploymentStore();

const UserDropdownItems = ref<Item[]>([
    {
        title: "Logout",
        icon: "solar:logout-3-bold",
        action() {
            user.logout();
            router.push({ path: '/login' });
        }
    }
])

function GetSidebarMode(path: string) {
    let result = "default";

    if (path.startsWith('/deployment/')) result = "deployment";
    if (path == '/login' || path == '/register') result = "auth";

    return result;
}

</script>

<style lang="scss" scoped>
aside.sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-right: 1px solid #ebebeb;

    &[mode="auth"] {
        display: none;
    }

    &[mode='deployment'] {
        .head {
            .default {
                display: none;
            }

            .deployment {
                display: flex;
            }
        }

        .body {
            .default {
                display: none;
            }

            .deployment {
                display: block;
            }
        }
    }

    .head {
        .appname {
            font-weight: 600;
            display: flex;
            flex-direction: column;

            .beta {
                display: inline-block;
                background: #0f0f0f;
                color: #fff;
                font-size: .70rem;
                padding: .15rem .25rem;
                border-radius: .25rem;
                vertical-align: middle;
                margin-left: .25rem;
            }

            .app {
                font-size: .85rem;
                opacity: .8;
            }
        }

        .default {
            display: flex;
            align-items: center;

            padding: 1rem;
            gap: .75rem;

            .logo {
                width: 2.5rem;
                height: 2.5rem;
                background: #0f0f0f;
                color: #fff;
                font-family: monospace;
                font-size: 1rem;
                display: grid;
                place-items: center;
                border-radius: .5rem;
            }
        }

        .deployment {
            display: none;
            align-items: center;

            padding: 1rem;
            gap: .75rem;

            button.back {
                background: transparent;
                border: none;
                outline: none;
                font-size: 1.35rem;
                width: 2rem;
                height: 2rem;
                aspect-ratio: 1/1;
                border-radius: .5rem;
                transition: .2s ease;
                display: grid;
                place-items: center;
                border: 1px solid transparent;

                border-bottom: 2px solid transparent;

                &:hover {
                    background: #fff;
                    border: 1px solid #e2e2e2;
                    border-bottom: 2px solid #e2e2e2;
                }
            }
        }
    }

    .body {
        .default {
            display: block;
        }

        .deployment {
            display: none;
        }

        .route {
            display: flex;
            align-items: center;
            gap: .70rem;
            padding: .50rem .65rem;
            margin: .55rem;
            border-radius: .45rem;
            border: 1px solid transparent;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            color: #000;
            text-decoration: none;
            transition: .2s ease;

            &:hover,
            &.active,
            &[active="true"] {
                border: 1px solid #e2e2e2;
                border-bottom: 2px solid #e2e2e2;
                background: #fff;

                svg {
                    opacity: .9;
                }

                span {
                    opacity: .9;
                }
            }

            svg {
                font-size: 1.25rem;
                width: 1em;
                height: 1em;
                opacity: .6;
                transition: .2s ease;
            }

            span {
                font-size: 1rem;
                font-weight: 500;
                opacity: .6;
                transition: .2s ease;
            }
        }
    }

    .bottom {
        margin-top: auto;

        display: felx;
        flex-direction: column;

        .user {
            display: flex;
            padding: 1rem;

            align-items: center;
            gap: .75rem;

            .icon {
                background: #0f0f0f;
                color: #fff;
                width: 2.25rem;
                height: 2.25rem;
                display: grid;
                place-items: center;
                border-radius: .5rem;

                svg {
                    font-size: 1.25rem;
                    width: 1em;
                    height: 1em;
                }
            }

            .meta {
                display: flex;
                flex-direction: column;

                .role {
                    font-size: .85rem;
                }
            }

            .dropdown {
                margin-left: auto;
            }
        }
    }
}
</style>