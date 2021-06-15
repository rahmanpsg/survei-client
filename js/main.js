Vue.component('v-select', VueSelect.VueSelect)

const URL = 'http://localhost/survei-server/api/'
// const URL = 'http://192.168.43.78/survei-server/api/'

new Vue({
    el: '#app',
    data: function () {
        return {
            tag_header: '#Survei Kepuasan Masyarakat (SKM)',
            header: 'Silahkan Masukkan Data Anda',
            data_pt: ['SD', 'SMP', 'SMA/SMK', 'Diploma', 'S1', 'S2 keatas'],
            data_pk: ['PNS/TNI/POLRI', 'Pegawai Swasta', 'Wiraswasta/Usahawan', 'Petani/Buruh', 'Pelajar/Mahasiswa', 'Lainnya'],
            data_ds: [],
            data_pertanyaan: [],
            formResponden: {
                nama: '',
                umur: '',
                desa: '',
                jenis_kelamin: '',
                pendidikan_terakhir: '',
                pekerjaan: ''
            },
            formSurvei: {},
            responden_error: false,
            survei_error: false,
            error_msg: null,
            show_pertanyaan: 1
        }
    },
    created: function () {
        // Load data Desa dari server
        $.ajax(`${URL}getData`, {
            data: {
                tabel: 'desa'
            },
            dataType: 'json'
        }).then(res => this.data_ds = res);

        // Load data Pertanyaan dari server
        $.ajax(`${URL}getData`, {
            data: {
                tabel: 'pertanyaan'
            },
            dataType: 'json'
        }).then(res => this.data_pertanyaan = res);
    },
    methods: {
        onComplete: function () {
            $.ajax(`${URL}simpanSurvei`, {
                data: {
                    responden: this.formResponden,
                    survei: {
                        jawaban: JSON.stringify(this.formSurvei)
                    }
                },
                type: 'post',
                dataType: 'json'
            }).then(res => {
                if (res) {
                    this.$swal("Informasi", "Terimakasih telah mengisi survei ini", "success", {
                        buttons: false,
                        timer: 1500,
                    }).then(() => {
                        this.$refs.wizard.reset();
                        this.$refs.wizard.changeTab(0, 0);
                        this.resetForm()
                    })
                } else {
                    this.$swal("Informasi", "Data gagal disimpan", "error")
                }
            }).catch(() => this.$swal("Informasi", "Data gagal disimpan", "error"))
        },
        isNumber: function (evt) {
            evt = (evt) ? evt : window.event;
            const charCode = (evt.which) ? evt.which : evt.keyCode;
            if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
                evt.preventDefault();;
            } else {
                return true;
            }

        },
        validateResponden() {
            this.responden_error = false

            const messages = {
                nama: 'Nama belum diisi',
                umur: 'Umur belum diisi',
                desa: 'Desa belum dipilih',
                jenis_kelamin: 'Jenis kelamin belum dipilih',
                pendidikan_terakhir: 'Pendidikan terakhir belum dipilih',
                pekerjaan: 'Pekerjaan belum dipilih'
            }

            for (let item in messages) {
                if (!this.formResponden[item]) {
                    this.responden_error = true
                    this.error_msg = messages[item]
                    return false;
                }
            }

            return true
        },
        validateSurvei() {
            if (!this.formSurvei[this.show_pertanyaan]) {
                this.survei_error = true
                this.error_msg = 'Pilih jawaban terlebih dahulu'
                return false
            }
            if (this.show_pertanyaan < this.data_pertanyaan.length) {
                this.survei_error = false
                this.show_pertanyaan++
                return false
            }
            return true
        },
        resetForm() {
            $.map(this.formResponden, (v, k) => {
                this.formResponden[k] = null;
            })

            $.map(this.formSurvei, (v, k) => {
                this.formSurvei[k] = null;
            })

            this.show_pertanyaan = 1
        }
    }
})