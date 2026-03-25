<template>
    <h1 class="title">Welcome Back, {{ user.username }}! 👋</h1>
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
        <div class="block">
            <div class="head">
                <Icon icon="solar:bill-check-bold" />
                <span>Subscription Expiration</span>
            </div>
            <div class="count">
                {{ intervalToDuration({
                    start: new Date(),
                    end: user.subscription.end
                }).days }} Days
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
import { userStore } from '../pinia';

import { intervalToDuration } from 'date-fns';

const user = userStore();
</script>

<style lang="scss" scoped>
.blocks {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    margin-top: 1rem;

    .block {
        display: flex;
        flex-direction: column;
        aspect-ratio: 4/1;
        width: 50%;
        flex: 0 0 49%;
        border: 1px solid #bebebe;
        border-radius: 1rem;
        padding: 1rem;

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
        }
    }
}

.fast-access {
    display: flex;
    margin-top: 1rem;
    gap: 1.25rem;
    flex-wrap: wrap;

    .deployments,
    .records {
        display: flex;
        flex-direction: column;
        flex: 0 0 48.75%;
        width: 50%;
        border: 1px solid #bebebe;
        padding: 1rem;
        border-radius: 1rem;
        min-height: 200px;
        margin-top: 1rem;

        @media screen and (max-width: 1100px) {
            & {
                flex: 0 0 100%;
            }
        }

        .head {
            display: flex;
            gap: .5rem;
            align-items: center;
            opacity: .85;

            svg {
                font-size: 1.25rem;
            }
        }

        .list {
            display: flex;
            flex-direction: column;
            margin-top: .85rem;

            .deployment,
            .record {
                display: flex;
                align-items: center;
                gap: .70rem;
                padding: .75rem 1rem;
                margin: .15rem 0;
                border-radius: 1rem;
                border: 1px solid transparent;
                border-bottom: 2px solid transparent;

                transition: .2s ease;

                cursor: pointer;

                &:hover,
                &.active {
                    border: 1px solid #e2e2e2;
                    border-bottom: 2px solid #e2e2e2;
                    background: #fff;

                    .next {
                        opacity: 1;
                    }
                }

                .app-name {
                    display: flex;
                    flex-direction: column;

                    .app {
                        font-size: .85rem;
                        opacity: .7;
                    }
                }

                .next {
                    transition: .2s ease;
                    display: inline-block;
                    opacity: 0;
                    margin-left: auto;

                    svg {
                        font-size: 1.25rem;
                        display: block;
                    }
                }
            }
        }
    }
}
</style>