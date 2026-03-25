<template>
    <div class="record" :active="RecordDataVisible">
        <div class="record-head">
            <div class="click-area" @click="RecordDataVisible = !RecordDataVisible">
                <div class="record-icon">
                    <Icon :icon="record.schema.icon" />
                </div>
                <div class="record-name">
                    <span class="type">
                        {{ record.schema.name }}
                    </span>
                </div>
                <div class="show-more">
                    <Icon icon="solar:alt-arrow-down-linear" />
                    <span>Details</span>
                </div>
            </div>
            <div class="details">
                <Dropdown :items="recordDropdownItems" :data="{ recordId: record.id }" />
            </div>
        </div>
        <div class="record-body" ref="">
            <div class="record-meta">
                <div class="record-data-display">
                    <span class="name">Created At</span>
                    <span class="value">{{ formatDuration(intervalToDuration({
                        start: new Date(record.createdAt), end:
                            new Date()
                    }), { format: ["hours", "minutes"] }) || "< 1 minute" }}</span>
                </div>

                <div class="record-data-display">
                    <span class="name">Last Updated</span>
                    <span class="value">{{ formatDuration(intervalToDuration({
                        start: new Date(record.updatedAt), end:
                            new Date()
                    }), { format: ["hours", "minutes"] }) || "< 1 minute" }}</span>
                </div>
            </div>
            <div class="record-data">
                <div class="record-data-display" v-for="[key, value] of Object.entries(record.data)">
                    <span class="name">{{ key.toLocaleUpperCase() }}</span>
                    <span class="value">{{ value }}</span>
                </div>
            </div>
            <div class="record-history">
                <div class="change" v-for="change of changeData" ref="Changes" :update=change.update>
                    <div class="change-meta" @click="ToggleChange(change.update)">
                        <span>{{ new Date(change.date).toLocaleString() }}</span>
                        <span>{{ change.update }}# Update
                            <Icon icon="solar:alt-arrow-down-linear" :inline=true />
                        </span>
                    </div>
                    <div class="change-body">
                        <div class="record-data-display" v-for="[key, value] of Object.entries(change.data)">
                            <span class="name">{{ key.toLocaleUpperCase() }}</span>
                            <span class="value">{{ value }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
import Dropdown from '../input/Dropdown.vue';
import { Item } from '../../types/Dropdown';
import { PropType, ref } from 'vue';
import { Change, Record } from '../../types/Deployment';
import { formatDuration, intervalToDuration } from 'date-fns';

const RecordDataVisible = ref<boolean>(false);

const Changes = ref<Array<HTMLDivElement | null>>([]);

const props = defineProps({
    recordDropdownItems: {
        required: true,
        type: Array as PropType<Item[]>
    },
    record: {
        required: true,
        type: Object as PropType<Record>
    }
})

function ToggleChange(id: number) {
    Changes.value.find((change) => {
        return change?.getAttribute('update') == id + ''
    })?.classList.toggle('active');
}
</script>

<style lang="scss" scoped>
.record {
    display: flex;
    flex-direction: column;
    margin: 1rem auto;
    border: 1px solid #bababa;
    border-radius: 1rem;
    position: relative;
    max-width: 50rem;

    transition: .2s ease;

    &:hover {
        box-shadow: 0px 4px 10px 0px #00000015;

        .show-more {
            svg {
                margin-top: .125rem;
            }

            span {
                margin-top: 0rem !important;
            }
        }
    }

    &[active="true"] {
        .record-body {
            display: flex;
        }

        .record-head {
            border-bottom: 1px solid #bababa;
        }
    }

    .record-body {
        // margin-top: 1rem;
        display: none;
        flex-wrap: wrap;
        align-items: center;
        padding: 1rem;
        gap: 1rem;

        .record-data-display {
            flex: 0 0 30%;
            width: 100%;

            display: flex;
            flex-direction: column;
            align-items: center;

            .name {
                font-size: .85rem;
                color: #444;
            }
        }

        .record-meta {
            display: flex;
            justify-content: space-evenly;
            width: 100%;

            .record-data-display span {
                &:first-child {
                    font-size: .75rem;
                    color: #444;
                }

                &:last-child {
                    font-size: .85rem;
                }
            }
        }


        .record-data {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
            gap: 1rem;
        }

        .record-history {
            width: 100%;

            .change {
                width: 100%;
                border: 1px solid #bababa;
                border-radius: 1rem;
                margin-bottom: 1rem;
                transition: .2s ease;

                &:last-child {
                    margin-bottom: 0;
                }

                &:hover {
                    box-shadow: 0px 4px 10px 0px #00000015;
                }

                &.active .change-body {
                    display: flex;
                }

                .change-meta {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    padding: 1rem;
                    cursor: pointer;

                    span {
                        font-size: .9rem;
                    }

                    svg {
                        position: relative;
                        top: 0;
                        font-size: 1.125rem;
                        transition: .2s ease;
                    }

                    &:hover svg {
                        top: 4px;
                    }
                }

                .change-body {
                    padding: 1rem;
                    display: none;
                    flex-wrap: wrap;
                    width: 100%;
                    gap: 1rem;
                }
            }
        }
    }

    .record-head {
        padding: 1rem;

        display: flex;

        align-items: center;
        gap: .5rem;

        // padding: 0 1rem;

        cursor: pointer;

        width: 100%;

        .click-area {
            display: flex;

            align-items: center;
            gap: .5rem;
            width: 100%;
        }


        .record-icon {
            display: grid;
            place-items: center;

            aspect-ratio: 1/1;
            width: 3rem;
            height: 3rem;

            background: #141414;
            color: #fff;
            border-radius: .5rem;

            svg {
                font-size: 1.25rem;
            }
        }

        .record-name {
            font-size: 1rem;
            display: flex;
            flex-direction: column;
            margin-right: auto;
            gap: .125rem;

            .target {
                font-size: .85rem;
            }
        }

        .threat-level {
            display: flex;
            place-items: center;
            flex-direction: row-reverse;

            svg {
                font-size: 1.5rem;

                &:hover+span {
                    display: block
                }
            }

            span {
                display: none;
                padding: .25rem .35rem;
                border: 1px solid #bababa;
                border-radius: .5rem;
                margin-right: .25rem;
                font-size: .9rem;
            }
        }

        .show-more {
            margin: 0 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;

            svg {
                transition: .2s ease;
                font-size: 1.25rem;
            }

            span {
                transition: .2s ease;
                margin-top: .125rem;
                margin-bottom: .125rem;
                font-size: .75rem;
            }
        }
    }
}
</style>