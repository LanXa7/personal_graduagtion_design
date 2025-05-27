import { defineStore } from "pinia";
export const useStore = defineStore('general', {
    state: () => {
        return {
            user: {
                id: -1,
                username: '',
                email: '',
                phone: '',
                roles: [],
                avatar: null,
                createTime: null
            },
        };
    }, getters: {
        avatarUrl() {
            if (this.user.avatar)
                return `/api/images${this.user.avatar}`;
            else
                return 'https://ts1.tc.mm.bing.net/th/id/R-C.2d165c39cb4c527c7a910f84ceb37799?rik=hTA2SKt67GUpAQ&riu=http%3a%2f%2fimg.soogif.com%2fACNwgduXYtytzz7JyAgxjzQRvedf416I.gif&ehk=gBvtZnce7OMHZKm%2fCfx48Cs9l5q8wLdxXn4AMbsLH4k%3d&risl=&pid=ImgRaw&r=0';
        }
    }, actions: {
        avatarUserUrl(avatar) {
            if (avatar)
                return `/api/images${avatar}`;
            else
                return 'https://ts1.tc.mm.bing.net/th/id/R-C.2d165c39cb4c527c7a910f84ceb37799?rik=hTA2SKt67GUpAQ&riu=http%3a%2f%2fimg.soogif.com%2fACNwgduXYtytzz7JyAgxjzQRvedf416I.gif&ehk=gBvtZnce7OMHZKm%2fCfx48Cs9l5q8wLdxXn4AMbsLH4k%3d&risl=&pid=ImgRaw&r=0';
        }
    }
});
