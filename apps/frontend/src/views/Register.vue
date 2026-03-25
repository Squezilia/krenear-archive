<template>
    <div class="container">
        <div class="login-form">
            <h1>Welcome new guy!</h1>
            <p>We're happy to see you among us, new guy! 😉</p>
            <Input placeholder="Username please..." icon="solar:user-bold" type="username" v-model="UsernameRef" />
            <Input placeholder="Password please..." icon="solar:key-minimalistic-bold" type="password"
                v-model="PasswordRef" />
            <Button icon="solar:forward-bold" icon-position="right" @click="Register()">Continue To Dashboard</Button>
            <span class="error">{{ ErrorRef }}</span>
            <RouterLink to="/login">Don't be afraid, you can already use your account.</RouterLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import defaultApiInterface from '../api/default';
import Button from '../components/input/Button.vue';
import Input from '../components/input/Input.vue';
import { userStore } from '../pinia';
import router from '../router';
import createProtectedApiInterface from '../api/protected';

const UsernameRef = ref<string>("");
const PasswordRef = ref<string>("");

const ErrorRef = ref<string>('');

const user = userStore();

const protectedApiInterface = createProtectedApiInterface();

if (user.token) TestAuthorization();

async function TestAuthorization() {
    const response = await protectedApiInterface({
        method: 'GET',
        url: 'auth/info'
    }).catch((error) => {
        if (!error.response) ErrorRef.value = 'Something went wrong, please try again later';
    })

    if (response) router.push('/');
}

async function Register() {
    const response = await defaultApiInterface({
        method: 'POST',
        url: 'auth/register',
        data: {
            username: UsernameRef.value,
            password: PasswordRef.value
        }
    }).catch((error) => {
        console.log(error);

        if (error.response) return ErrorRef.value = error.response.data.error;

        ErrorRef.value = 'Something went wrong, please try again later.';
    });

    if (!response) return;

    const token = response.data.token;

    user.token = token;
    user.username = UsernameRef.value;
    user.id = response.data.user.id;
    user.createdAt = response.data.user.createdAt;
    user.roles = response.data.user.roles;
    user.subscription.start = response.data.user.subscriptionStartDate;
    user.subscription.end = response.data.user.subscriptionEndDate;
    user.subscription.levels = response.data.user.subscription;

    user.save();

    router.push('/');
}
</script>

<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .login-form {
        display: flex;
        flex-direction: column;
        gap: .45rem;
        padding: 1rem;
        border-radius: 1rem;
        justify-content: center;

        h1 {
            font-size: 3rem;
        }

        p {
            margin-bottom: .5rem;
        }

        .input-group {
            margin: 0 auto;
            max-width: 275px;
            width: 100%;
        }

        button {
            margin: .5rem auto 0 auto;
        }

        a {
            color: #1c5285;
            margin: .5rem auto 0 auto;
        }

        .error {
            margin: 0 auto;

            color: #a16868;
        }
    }
}
</style>