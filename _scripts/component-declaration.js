/* custom utility functions */
const customRedirect = loc => loc ? window.location.assign(loc) : '';
const ucword = word => word[0].toUpperCase() + word.slice(1).toLowerCase();
const $q = document.querySelector.bind(document);

function savePDF(fn, title) {
  const pdfDoc = new jsPDF('p', 'px', 'A4');
  pdfDoc.addImage(logourl, 'JPEG', 30, 25, 70, 70);
  pdfDoc.addImage(watermarkurl, 'JPEG', 100, 200, 250, 250);
  pdfDoc.fromHTML($q('#resultBanner'), 115, 35);
  pdfDoc.fromHTML($q('#resultDetail'), 70, 160);
  pdfDoc.addImage(signatureurl, 'JPEG', 60, 545, 50, 20);
  pdfDoc.fromHTML($q('#signature'), 60, 565);

  pdfDoc.save(`${fn}_${title}.pdf`);
}

function previewFile() {
  var preview = document.querySelector('img');
  var file = document.querySelector('input[type=file]').files[0];
  var reader = new FileReader();

  reader.addEventListener(
    'load',
    function() {
      preview.src = reader.result;
    },
    false
  );

  if (file) {
    reader.readAsDataURL(file);
  }
}

const { mapState, mapGetters, mapActions } = Vuex;

/* Global Filters */
Vue.filter('formatTime', str => (+str < 10 ? '0' : '') + str); // filter @param by padding it with 0 
Vue.filter('unknownRoute', str => router.push(str)); // push unknown routes to 404 
Vue.filter('uppercase', str => str.toUpperCase());
Vue.filter('lowercase', str => str.toLowerCase());
Vue.filter('capitalize', str => str.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' '));
Vue.filter('formatDateTime', value => {
  const fp = n => (+n < 10 ? '0' + n : n);
  let p = new Date(value);
  let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let wd = days[p.getDay()]
  let day = fp(p.getDate());
  let month = fp(p.getMonth() + 1);
  let year = p.getFullYear();
  let sec = fp(p.getSeconds());
  let min = fp(p.getMinutes());
  let hr = p.getHours();
  let ampm = hr > 11 ? 'PM' : 'AM';
  hr = fp(hr % 12 || 12);
  return `${wd} ${day}|${month}|${year} ${hr}:${min}:${sec} ${ampm}`;
});

Vue.filter('formatDate', value => {
  const fp = n => (+n < 10 ? '0' + n : n);
  let p = new Date(value);
  let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let wd = days[p.getDay()]
  let day = fp(p.getDate());
  let month = fp(p.getMonth() + 1);
  let year = p.getFullYear();
  return `${wd} ${day}|${month}|${year}`;
}, );

/* Global Mixins */
const alertMixin = {
  data() {
    return {
      showAlert: false,
      alertVariant: '',
      alertMsg: '',
    }
  },
  methods: {
    setAlert(msg, variant) {
      this.alertMsg = msg;
      this.alertVariant = variant;
      this.showAlert = true;
    },
  }
};

const PasswordInput = { // global component
  template: `
			<b-form-group :description="description" :label="label" label-for="user-passwd">
				<b-input-group >
				<b-input-group-prepend is-text><b-icon icon="lock"></b-icon></b-input-group-prepend>
					<input class="form-control" id="user-passwd" :type="type" :placeholder="placeholder" @input="$emit('input',$event.target.value)" :value="value" aria-label="Password" required></input>
					<b-input-group-append is-text><b-icon :icon="icon" @click="showPass=!showPass"></b-icon></b-input-group-append>
				</b-input-group>
			</b-form-group>
				`,
  props: {
    placeholder: String,
    label: String,
    description: String,
    value: String,
  },
  data: () => ({ showPass: false }),
  computed: {
    icon() {
      return this.showPass ? 'eye-slash-fill' : 'eye-fill';
    },
    type() {
      return this.showPass ? 'text' : 'password';
    },
  },
};

const CountdownTimer = {
  // local component used only in MainBanner
  template: `
      <span class="d-block">
        <strong class="text-danger" v-if="timeup">Time Up!</strong>
        <span class="btn btn-success btn-sm" role="group" aria-label="time" v-else>
          <span>{{hrs | formatTime}}H: </span>
          <span>{{mins | formatTime}}M: </span>
          <span>{{secs | formatTime}}S</span>        
        </span>
      </span>
      `,
  data() {
    return {
      hrs: '',
      mins: '',
      secs: '',
    };
  },
  computed: mapState(['activeSetup', 'timeup']),
  methods: mapActions(['setTimeup']),
  mounted() {
    let { hrs, mins, secs } = this.activeSetup;
    let h = +hrs;
    let m = +mins;
    let s = +secs;

    let Timer = setInterval(() => {
      if (s > 0) {
        s--;
      } else if (s === 0 && m > 0) {
        m--;
        s = 60;
      } else if (m === 0 && h > 0) {
        h--;
        m = 60;
      } else {
        clearInterval(Timer); // time is up , stop the time
        this.setTimeup(true); // display timeup and submitAns();
      }

      // update time
      this.hrs = h;
      this.mins = m;
      this.secs = s;
    }, 1000);
  },
};

const MiniProfile = {
  // global component
  template: `
					<div class="mini-profile">         
            <span class="font-weight-bold d-block text-dark">{{fullName}}</span> 
						<countdown-timer v-if="showTime" class="mini-profile"></countdown-timer>							
						<a class="btn btn-success btn-sm text-white mini-profile" @click="logout" v-else><b-icon icon="box-arrow-right"></b-icon> Logout</a>         
          </div>`,
  components: { 'countdown-timer': CountdownTimer },
  computed: {
    ...mapState(['showTime']),
    ...mapGetters(['fullName']),
  },
  methods: {
    logout() {
      // store.dispatch('setLogin');
      // router.push('/login');
      customRedirect('./');
    },
  },
};

const MainBanner = {
  // global component
  template: `
        <div class="d-flex align-items-center justify-content-around text-center">
          <img src="_images/logo.jpg" alt="logo" class="mb-1 rounded-circle brand-logo">
					<div class="text-center text-success font-weight-bold p-2 brand-tag flex-fill w-100">
						Department of {{deptName}} <br>Computer Based Examination <br>Portal
					</div>					
				</div>`,
  computed: {
    ...mapGetters(['deptName']),
  },
};

const MainFooter = { // global component
  template: `
      <footer class="text-center">
        <p class="mt-3 mb-0 text-muted">&copy; {{ new Date().getFullYear() }} 
            Department of {{deptName}}, <br /> Federal Teaching Hospital, Ido-Ekiti, Ekiti State, Nigeria.</p>
      </footer>`,
  computed: mapGetters(['deptName']),
};

const ShowAlert = {
  // global component
  template: `
		<b-alert :variant="alertVariant" :show="alertCountDown" @dismiss-count-down="countDown" dismissible @dismissed="dismissedAlert">
			<p> {{ alertMsg }} </p>
			<b-progress :variant="alertVariant" :max="dismissSecs" :value="alertCountDown" height="0.3rem"></b-progress>
		</b-alert>`,
  props: {
    alertVariant: String,
    alertMsg: String,
    showAlert: Boolean,
  },
  data() {
    return {
      dismissSecs: 5,
      alertCountDown: 0,
    };
  },
  methods: {
    countDown(countDown) {
      this.alertCountDown = countDown;
    },
    dismissedAlert() {
      this.alertCountDown = 0;
      this.$parent.showAlert = false;
    },
  },
  watch: {
    showAlert(newValue) {
      newValue ? this.alertCountDown = this.dismissSecs : '';
    }
  }
};

const TestView = {
  // local component used only in TestPage
  template: `
    <div>      
      <ol id="questions" :start="listStart" v-if="questnType === 'bop'">
        <li class="border rounded mb-2 shadow-sm p-1" v-for="q in questions" :key="q.qid">
          <div class="px-1">{{ q.questn.question }}</div>
          <ul class="list-unstyled">
            <li class="border-top p-1"><span class="btn btn-danger btn-sm" @click="$emit('resetans', q.qid)">Reset Answer</span></li>
          <li v-for="(opt, optIndex) in q.questn.options" class="border-top px-1">
            <label>
              <input @change="$emit('processans', $event)" type="radio" :name="q.qid" :id="opt.id" :value="opt.ans" :data-oi="optIndex"> {{opt.option}}
            </label>
          </li>              
          </ul>
        </li>
      </ol>
      <ol id="questions" :start="listStart" v-else-if="questnType === 'tof'">
        <li class="border rounded mb-2 shadow-sm p-1" v-for="q in questions" :key="q.qid">
          <div class="px-1">{{q.questn.question}}</div>
          <ul class="list-unstyled">              
            <li v-for="(opt, optIndex) in q.questn.options" class="border-top px-1">
              <span class="btn btn-danger btn-sm" @click="$emit('resetans', opt.id)">Reset Answer</span>
              <label class="btn btn-outline-success btn-sm mt-1">
                <input type="radio" @change="$emit('processans', $event)" :id="'t' + opt.id" :name="opt.id" :value="1" :data-ca="opt.ans" :data-oi="optIndex"> True 
              </label>
              <label class="btn btn-outline-success btn-sm mt-1">
                <input type="radio" @change="$emit('processans',$event)" :id="'f' + opt.id" :name="opt.id" :value="0" :data-ca="opt.ans" :data-oi="optIndex"> False 
              </label>
              <span>{{opt.option}}</span>
            </li>
          </ul>
        </li>
      </ol> 
      <ol id="questions" :start="listStart" v-else-if="questnType === 'pic'">
        <li class="mb-2 shadow-sm p-1" v-for="q in questions" :key="q.qid">
          <figure class="figure">
            <img :src="q.picture" alt="picture" class="figure-img img-fluid rounded">
            <figcaption class="figure-caption text-center font-weight-bold">{{q.questn.question}}</figcaption>
          </figure> 
          <hr>             
        </li>
      </ol>
      <b-alert v-else show variant="danger">Sorry, we can't find what you are looking for? 
        <br> Kindly follow the right link  
        <a class="btn btn-success" href="./">Back to Home</a>
      </b-alert>
    </div>
	`,
  props: {
    listStart: Number,
    questions: Array,
    questnType: String,
  },
};

const SideAnswer = {
  // local component used only in TestPage
  template: `
    <div>
      <h5 class="text-center text-success">Your Answers</h5>
      <ol v-if="questnType === 'bop'">				   
        <li v-for="q in questions" :key="q.qid">
        <b class="text-success">{{ getAns(q.qid) }}</b>
        </li>
      </ol>       
      <ol v-else>
        <li class="" v-for="q in questions" :key="q.qid">
            <span v-for="(o, index) in q.questn.options" class="border px-1 mr-1">
              {{ options[index] }}: <span class="text-success">{{ getAns(o.id) }}</span>
            </span>
        </li>
      </ol>
    </div> 
	`,
  props: {
    questnType: String,
    questions: Array,
    answers: Array,
  },
  data() {
    return {
      options: ['A', 'B', 'C', 'D', 'E'],
    };
  },
  methods: {
    getAns(val) {
      let ans = this.answers.length > 0 ? this.answers.find(a => a.name === val) : '';
      switch (this.questnType) {
        case 'bop':
          return ans ? this.options[ans.oi] : '';
        default:
          if (ans) {
            return +ans.value === 1 ? 'T' : 'F';
          }
          return '';
      }
    },
  },
};

const TestPage = {
  // global component
  template: `
		<div>      
			<b-pagination
				v-model="currentPage"
				:total-rows="totalQuestions"
				:per-page="perPage"
				aria-controls="questions"
				class="justify-content-center mt-2"
      ></b-pagination>
      <b-row>
        <b-col>
        <keep-alive>
          <test-view :questn-type="questnType" :list-start="listStart" :key="'a' + listStart" :questions="curQuestions" @processans="processAnswers" @resetans="resetAns"></test-view>
        </keep-alive>
        <div class="text-center mb-1"><button v-if="finish" class="btn btn-success shadow-sm" @click="submitAns">Submit</button></div>
        </b-col>
        <b-col class="d-none d-lg-block" lg="4" xl="3" v-if="questnType === 'bop' || questnType === 'tof'">
          <side-answer :questions="questions" :answers="answers" :questn-type="questnType"></side-answer>
        </b-col>
      </b-row>
			<b-pagination
				v-model="currentPage"
				:total-rows="totalQuestions"
				:per-page="perPage"
				aria-controls="questions"
				class="justify-content-center"
			></b-pagination>				
		</div>
	`,
  components: {
    'test-view': TestView,
    'side-answer': SideAnswer,
  },
  data() {
    return {
      currentPage: 1,
      answers: [],
      questnType: '',
      activeQuestn: '',
      questions: [],
      setup: {},
    };
  },
  computed: {
    ...mapState(['timeup']),
    ...mapGetters(['userId']),
    perPage() {
      return this.setup.questns_per_page;
    },
    totalQuestions() {
      return this.setup.total_questns || this.questions.length;
    },
    pageEnd() {
      return this.currentPage * this.perPage;
    },
    pageStart() {
      return this.pageEnd - this.perPage;
    },
    listStart() {
      return this.pageStart + 1;
    },
    curQuestions() {
      return this.questions.slice(this.pageStart, this.pageEnd);
    },
    finish() {
      return this.currentPage === Math.ceil(this.totalQuestions / this.perPage);
    },
  },
  watch: {
    timeup(newValue) {
      newValue ? this.submitAns() : '';
    },
  },
  methods: {
    ...mapActions(['setLoading', 'setTimeup']),
    processAnswers(ev) {
      let answer;
      if (this.questnType === 'bop') {
        const {
          id,
          name,
          value,
          dataset: { oi },
        } = ev.target;
        answer = { id, name, value, oi };
      } else if (this.questnType === 'tof') {
        const {
          id,
          name,
          value,
          dataset: { ca },
          dataset: { oi },
        } = ev.target;
        answer = { id, name, value, ca, oi };
      }
      if (this.answers.length > 0) {
        let ansUpdated = this.answers.find(ans => ans.name === answer.name);
        if (ansUpdated) {
          this.answers.map((ans, index) => {
            if (ans.name === answer.name) {
              this.answers.splice(index, 1, answer);
            }
          });
        } else {
          this.answers.push(answer);
        }
      } else {
        this.answers.push(answer);
      }
    },
    resetAns(qid) {
      if (!qid) {
        return;
      }
      this.answers.map((ans, index) => {
        if (ans.name === qid) {
          const removedAns = this.answers.splice(index, 1)[0]; // first element in the returned array
          document.querySelector(`#${removedAns.id}`).checked = false;
        }
      });
    },
    submitAns() {
      this.setLoading(true);
      const data = {
        ans: this.answers,
        userId: this.userId,
        setupId: this.setup.setup_id,
        questnsTotal: this.totalQuestions,
        questnType: this.questnType,
      };
      const url = `_api/answers_${this.questnType}.php`;
      // console.log('data:', data, 'url:', url);
      axios
        .post(url, data)
        .then(() => {
          this.setLoading(false);
          // console.log(res.data);
          this.timeup ? this.setTimeup(false) : '';
          router.push('/user');
        })
        .catch(err => {
          this.setLoading(false);
          console.error(err);
        });
    },
  },
  created() {
    this.questnType = this.$route.params.qtype;
    this.activeQuestn = 'questns' + this.questnType[0].toUpperCase() + this.questnType.slice(1);
    this.setup = {...store.getters.activeSetup(this.questnType) };
    this.questions = [...store.getters.getState(this.activeQuestn)];
    store.dispatch('setActiveSetup', this.setup);
  },
  beforeMount: () => store.dispatch('setShowTime', true),
  beforeDestroy: () => store.dispatch('setShowTime', false),
};

const AnswerAnalysis = {
  // local component used only in ResultAnalysis
  template: `    
    <span :class="[ ans.klas, correctAns ]" class="rounded p-1" v-if="questnType === 'bop'">
      <input type="radio" :checked="ans.checked"> {{ opt.option }}
      <b-icon :icon="ans.icon" v-show="ans.showIcon"></b-icon>
    </span>          	
    
    <span v-else>
      <span class="btn btn-sm mt-1" :class="btnType(ans.checked) === 1 ? 'btn-success': 'btn-outline-success'">
        <input type="radio" :checked="ans.checked === 1 ? true : false"> True 
      </span>
      <span class="btn btn-sm mt-1" :class="btnType(ans.checked) === 0 ? 'btn-success': 'btn-outline-success'">
        <input type="radio" :checked="ans.checked === 0 ? true : false"> False 
      </span>
      <span :class="ans.klas" class="rounded p-1">{{ opt.option }}
        <b-icon :icon="ans.icon" v-show="ans.showIcon"></b-icon>
      </span> 
    </span>
	`,
  props: {
    opt: Object,
    answers: Array,
    questnType: String,
  },
  computed: {
    ans() {
      let af;
      switch (this.questnType) {
        case 'bop':
          af = this.answers.length > 0 ? this.answers.find(a => a.id === this.opt.id) : '';
          if (af) {
            return +af.value === 1 ? { klas: '', icon: 'check2', checked: true, showIcon: true } : { klas: 'bg-danger text-white', icon: 'x', checked: true, showIcon: true };
          } else {
            return { klas: '', icon: '', checked: false, showIcon: false };
          }
        default:
          af = this.answers.length > 0 ? this.answers.find(a => a.name === this.opt.id) : '';
          if (af) {
            return +af.value === +af.ca ? { klas: 'bg-success text-white', icon: 'check2', checked: +af.value, showIcon: true } : { klas: 'bg-danger text-white', icon: 'x', checked: +af.value, showIcon: true };
          } else {
            return { klas: '', icon: '', checked: '', showIcon: false };
          }
      }
    },
    correctAns() {
      return +this.opt.ans === 1 ? 'bg-success text-white' : '';
    },
  },
  methods: {
    btnType(val) {
      if (val === '') {
        return +this.opt.ans === 1 ? 1 : 0;
      } {
        return '';
      }
    },
  },
};

const ResultAnalysis = {
  // global component
  template: `
		<div>      
			<b-pagination
				v-model="currentPage"
				:total-rows="totalQuestions"
				:per-page="perPage"
				aria-controls="questions"
				class="justify-content-center mt-2"
      ></b-pagination>
      <div class="d-flex align-items-center justify-content-around my-1">
				<h6 class="text-success mb-0"><b-icon icon="list-check"></b-icon> {{ qTitle  }} Result Analysis </h6>
				<b-link to="/user/r"><b-icon icon="arrow-left-circle-fill"></b-icon> back to summary</b-link>
			</div>
      <div>
        <keep-alive>
          <ol :start="listStart">				   
            <li class="border rounded mb-2 shadow-sm p-1" v-for="q in curQuestions" :key="q.qid">
              <div class="px-1">{{ q.questn.question }}</div>
              <ul class="list-unstyled">					
              <li v-for="opt in q.questn.options" class="border-top px-1">
                <answer-analysis :questn-type="questnType" :opt="opt" :key="opt.id" :answers="answers"></answer-analysis>
              </li>              
              </ul>
            </li>
          </ol>           
        </keep-alive>       
      </div>
			<b-pagination
				v-model="currentPage"
				:total-rows="totalQuestions"
				:per-page="perPage"
				aria-controls="questions"
				class="justify-content-center"
			></b-pagination>				
		</div>
	`,
  components: { 'answer-analysis': AnswerAnalysis },
  data() {
    return {
      currentPage: 1,
      answers: [],
      questnType: '',
      activeQuestn: '',
      questions: [],
      setup: {},
    };
  },
  computed: {
    ...mapGetters(['userId']),
    perPage() {
      return this.setup.questns_per_page;
    },
    totalQuestions() {
      return this.setup.total_questns || this.questions.length;
    },
    pageEnd() {
      return this.currentPage * this.perPage;
    },
    pageStart() {
      return this.pageEnd - this.perPage;
    },
    listStart() {
      return this.pageStart + 1;
    },
    curQuestions() {
      return this.questions.slice(this.pageStart, this.pageEnd);
    },
    qTitle() {
      let title = { bop: 'Best Option', tof: 'True or False', pic: 'Picture' };
      return title[this.questnType];
    },
  },
  methods: {
    ...mapActions(['setLoading']),
  },
  created() {
    this.questnType = this.$route.params.qtype;
    this.activeQuestn = 'questns' + this.questnType[0].toUpperCase() + this.questnType.slice(1);
    this.activeAns = 'answers' + this.questnType[0].toUpperCase() + this.questnType.slice(1);
    this.setup = {...store.getters.activeSetup(this.questnType) };
    this.questions = [...store.getters.getState(this.activeQuestn)];
    this.answers = [...store.getters.getState(this.activeAns)][0].answers;
    store.dispatch('setActiveSetup', this.setup);
  },
};

const ResultPage = {
  // global component
  template: `
		<div>
			<h3 class="text-center text-primary">{{ msg }} </h3>	
			<b-row align-h="around">
      <b-col class="mb-2 col-auto col-md">
      <b-card no-body>
      <b-tabs card align="center" lazy>
      <b-tab v-for="(a, index) in answers" :key="'result'+ index" :title="a.title">
        <h5 class="text-center font-weight-bold text-success">{{ a.title }}</h5>
        <b-nav tabs align="center" v-if="userSeeAnalysis">
          <b-nav-item :to="'/user/a/' + a.qtype">Result Analysis <b-icon icon="check2-all"></b-icon></b-nav-item>
          <b-nav-item @click="genPDF(fullName, a.title)">PDF <b-icon icon="download"></b-icon></b-nav-item>
        </b-nav>
        
          <div id="resultBanner" v-show="false">
          <h4 class="mb-1">{{ schName }}</h4>
          <h5 class="mb-1">Department of {{ deptName }}</h5>
          <h5 class="mb-1"> {{ schAddress }}</h5>
          <h5 class="mt-5 text-success">REGISTRAR'S NAME: {{ fullName }}</h5>
          <h5 class="mt-3 text-success">{{ a.title }}</h5>
        </div>
      <div id="resultDetail">
  <b-table-simple hover small :id="'result'+ a.qtype" bordered>
    <b-tbody>
      <b-tr v-for="(fd, idx) in fields" :key="'fid' + idx">
        <b-th class="text-right">{{ fd.label }}</b-th>
        <b-td v-if="fd.key === 'pass'">
          <span v-if="(+a.ans[fd.key] === 1)" class="text-success">
            <b-icon icon="award-fill"></b-icon> Congratulations! &nbsp;&nbsp;&nbsp;
          </span> 
          <span v-else class="text-danger">
            <b-icon icon="exclamation-triangle-fill"></b-icon> Sorry! You did not Pass.
          </span>
        </b-td>
        <b-td v-else-if="fd.key === 'created_on'">
          {{ a.ans[fd.key] | formatDate }} 
        </b-td>
        <b-td v-else>{{ a.ans[fd.key] }}</b-td>
      </b-tr> 
    </b-tbody>    
  </b-table-simple>        
        </div>       
        </b-tab>	
        </b-tabs>			
        </b-card>			
      </b-col>
      <b-col cols="12" class="text-center">
        <img :src="HODSign" alt="HOD Signature" id="signImg">
        <div id="signature">
          <h6 class="font-weight-bold">{{ HODName }},</h6>
          <h6 class="font-weight-400 font-italic">HOD, Department of {{ deptName }}.</h6>
        </div>
      </b-col>	
			</b-row>	
		</div>
	`,
  data() {
    return {
      msg: 'Result',
      fields: [
        { key: 'created_on', label: 'Exam Period' },
        { key: 'questns_total', label: 'Total Questions' },
        { key: 'questns_answered', label: 'Questions Answered' },
        { key: 'questns_unanswered', label: 'Questions unanswered' },
        { key: 'questns_passed', label: 'Questions Passed' },
        { key: 'questns_failed', label: 'Questions Failed' },
        { key: 'initial_score', label: 'Initial Score' },
        { key: 'final_score', label: 'Final Score (%)' },
        { key: 'pass', label: 'Remark' },
      ],
      title: { bop: 'Best Options Result', tof: 'True or False Result', pic: 'Picture Results' },
      schName: 'Federal Teaching Hospital, Ido-Ekiti',
      schAddress: 'P.M.B 201, Ido-Ekiti, Ekiti State, Nigeria',
      logo: '_images/logo.jpg',
      watermark: '_images/watermark.jpg',
    };
  },
  computed: {
    ...mapState(['curUser', 'setup', 'answersBop', 'answersTof', 'answersPic', 'department']),
    ...mapGetters(['userSeeAnalysis', 'fullName']),
    HODName() {
      return this.department.hod_name;
    },
    HODSign() {
      return this.department.hod_sign;
    },
    deptName() {
      return this.department.dept_name;
    },
    userId() {
      return this.curUser.user_id;
    },
    answers() {
      let allAnswers = [];
      let cuserId = this.userId;
      this.setup.map(s => {
        if (s.questn_type === 'pic') return;
        let ansType = 'answers' + ucword(s.questn_type);
        let qtype = s.questn_type;
        let title = this.title[s.questn_type];
        let curAnswers = this[ansType];
        let ans = curAnswers.find(a => a.setup_id === s.setup_id && a.user_id === cuserId);
        ans ? allAnswers.push({ qtype, title, ans }) : '';
      });
      return allAnswers;
    },
  },
  methods: {
    ...mapActions(['setLoading']),
    genPDF(fn, title) {
      savePDF(fn, title);
    },
  },
};

const userSetup = {
  // local component used only in UserDashboard
  template: `
			<div class="p-2 mt-1 rounded bg-white d-block" v-b-hover="handleHover" :class="{'shadow-lg': isHovered}">
				<h5 class="text-danger">{{ title[s.questn_type] }} {{ s.category }}</h5>
				<div v-if="testTaken" class="mb-1 font-weight-bold text-primary">
					<h5>{{ s.category }} Completed:  take the next {{ s.category | lowercase }}.</h5>
				</div>
				<div v-else>
					<strong class="mb-2 d-block">Total Questions:
						<b-badge variant="success">{{s.total_questns}}</b-badge>
					</strong>
					<strong class="mb-2 d-block">Duration:
					<b-badge variant="success">{{s.hrs | formatTime}}H: {{s.mins | formatTime}}M: {{s.secs | formatTime}}S </b-badge>
					</strong>
					<b-button :to="'/user/t/' + s.questn_type" variant="success" size="sm">Start {{s.category}}</b-button>
				</div>				
			</div>        
	`,
  props: { s: Object },
  data: () => ({
    isHovered: false,
    title: { bop: 'Best Option', tof: 'True or False', pic: 'Picture' },
  }),
  computed: {
    ...mapGetters(['userId']),
    ansType() {
      return 'answers' + ucword(this.s.questn_type);
    },
    answers() {
      return store.getters.getState(this.ansType);
    },
    testTaken() {
      return this.answers.some(ans => ans.setup_id === this.s.setup_id && ans.user_id === this.userId);
    },
  },
  methods: {
    handleHover(hovered) {
      this.isHovered = hovered;
    },
  },
};

const UserDashboard = {
  // global component
  template: `
		<div>
			<div v-if="activeUser">
        <div v-if="allTestTaken" class="py-2 mt-2 rounded shadow-sm bg-white font-weight-bold">				
          <h5 class="text-success">All {{ category }} Completed</h5>  
          <b-link to="/user/r" v-if="userSeeResult">Check Result</b-link>
        </div>
        <div v-else>
          <div>
            <h5><b-link v-b-toggle.gen-instruction>Instruction <b-icon icon="caret-down-fill" size="sm"></b-icon></b-link></h5>
            <b-collapse visible id="gen-instruction">													
              <p><b-alert variant="primary" show>{{ genInstruction}} </b-alert></p>		
            </b-collapse>
          </div>
          <user-setup v-for="s in setup" :key="s.setup_id" :s="s" :user-id="userId"></user-setup>
        </div>		
      </div>
      <h5 v-else class="text-primary">Welcome {{ fullName }}.</h5>
		</div>        
	`,
  components: { 'user-setup': userSetup },
  computed: {
    ...mapState(['setup', 'answersBop', 'answersTof', 'answersPic']),
    ...mapGetters(['userId', 'userSeeResult', 'genInstruction', 'activeUser', 'fullName']),
    category() {
      return this.setup.length > 0 ? this.setup[0].category : '';
    },
    allTestTaken() {
      let allCompleted = true;
      let cuserId = this.userId;
      this.setup.map(s => {
        let ansType = 'answers' + ucword(s.questn_type);
        let answers = this[ansType];
        let curCompleted = answers.some(ans => ans.setup_id === s.setup_id && ans.user_id === cuserId);
        !curCompleted ? (allCompleted = false) : '';
      });
      return allCompleted;
    },
  },
  methods: {
    ...mapActions([
      'setBgClass',
      'setContainer',
      'setShowWelcome',
      'setSetup',
      'setAnswersBop',
      'setAnswersTof',
      'setAnswersPic',
    ]),
  },
  created() {
    this.setBgClass('bg-2');
    this.setContainer('mini-container');
    axios
      .all([
        axios.get('_api/setup.php?_u=1'),
        axios.get(`_api/answers_bop.php?_u=1&_u_id=${this.userId}`),
        axios.get(`_api/answers_tof.php?_u=1&_u_id=${this.userId}`),
        axios.get(`_api/answers_pic.php?_u=1&_u_id=${this.userId}`),
      ])
      .then(
        axios.spread((setup, a_bop, a_tof, a_pic) => {
          this.setSetup(setup.data);
          this.setAnswersBop(a_bop.data);
          this.setAnswersTof(a_tof.data);
          this.setAnswersPic(a_pic.data);
        })
      )
      .catch(err => console.error(err));
  },
  beforeDestroy() {
    this.setBgClass('');
    this.setContainer('main-container');
  },
};

const UserPage = {
  // global componet
  template: `
      <main :class="bgClass">
        <div :class="container">
          <div class="d-flex flex-wrap align-items-center justify-content-around text-center mx-auto">
						<main-banner></main-banner>
						<mini-profile></mini-profile>
					</div>          
          <router-view></router-view>
          <main-footer></main-footer>
        </div>
      </main>`,
  computed: {
    ...mapState(['bgClass', 'container']),
    // ...mapGetters(['userId']),
  },
  methods: mapActions(['setQuestnsBop', 'setQuestnsTof', 'setQuestnsPic', 'setInstructions']),
  created() {
    axios
      .all([
        axios.get('_api/instructions.php'),
        axios.get('_api/questions_bop.php?_u=1'),
        axios.get('_api/questions_tof.php?_u=1'),
        axios.get('_api/questions_pic.php?_u=1'),
      ])
      .then(
        axios.spread((inst, q_bop, q_tof, q_pic) => {
          this.setInstructions(inst.data[0]);
          this.setQuestnsBop(q_bop.data);
          this.setQuestnsTof(q_tof.data);
          this.setQuestnsPic(q_pic.data);
        })
      )
      .catch(err => console.error(err));
  },
};

const AdminDashboard = {
  template: `
		<div class="text-center">
			<b-jumbotron>
				<template v-slot:header>
				<h2><small><b-icon icon="tools"></b-icon></small> Admin Dashboard</h2> 
				</template>
				<template v-slot:lead>
				<h5 class="text-success text-wrap h"><small>Welcome</small> {{ fullName }}</h5>
				</template>
			</b-jumbotron>
		</div>
	`,
  computed: mapGetters(['fullName']),
};

const UserForm = {
  template: `
			<div class="mt-2 mb-2 border-bottom border-top shadow p-2" v-if="showForm">
				<b-form @submit.prevent="formSubmit()" @reset.prevent="formReset">
					<div class="d-flex flex-column">
						<h4 class="text-success text-center" v-if="formType === 'new'">
						<b-icon icon="person-plus-fill"></b-icon> New {{ userType | capitalize }}</h4>
						<h4 class="text-success text-center" v-else>
						<b-icon icon="pencil-square"></b-icon> Edit {{ userType | capitalize }}</h4>							
						<b-row>
							<b-col cols="12" md="6" lg="4"><b-form-group label="Surname" label-for="surname">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="person-circle"></b-icon></b-input-group-prepend>
									<b-form-input id="surname" v-model="uForm.last_name" trim required autofocus></b-form-input>
								</b-input-group>
							</b-form-group></b-col>
							<b-col cols="12" md="6" lg="4"><b-form-group label="First Name" label-for="firstname">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="person-square"></b-icon></b-input-group-prepend>
									<b-form-input id="firstname" v-model="uForm.first_name" trim required></b-form-input>
								</b-input-group>
							</b-form-group></b-col> 
							<b-col cols="12" md="6" lg="4"><b-form-group label="Other Name" label-for="midname">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="person-bounding-box"></b-icon></b-input-group-prepend>
									<b-form-input id="midname" v-model="uForm.mid_name" trim required></b-form-input>
								</b-input-group>
							</b-form-group></b-col> 

							<b-col cols="12" md="6" lg="4"><b-form-group label="User ID" label-for="user-id">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="shield-lock"></b-icon></b-input-group-prepend>
									<b-form-input id="user-id" v-model="uForm.reg_num" trim required></b-form-input>
								</b-input-group>
							</b-form-group></b-col>

							<b-col cols="12" md="6" lg="4"><password-input label="Password" v-model.trim="uForm.passwd" :value="uForm.passwd"></password-input></b-col>		

							<b-col cols="12" md="6" lg="4"><b-form-group label="Status:" label-for="status">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="shuffle"></b-icon></b-input-group-prepend>
									<b-form-select id="status" v-model="uForm.active" :options="status" required number></b-form-select>
								</b-input-group>
							</b-form-group></b-col>
						</b-row>
						<b-row align-h="center"><b-col cols="auto">
							<button class="btn btn-success btn-sm" type="submit"><b-icon icon="cursor"></b-icon>&nbsp;{{ formType === 'new' ? 'Add' : 'Save Changes' }}</button> &nbsp; 
							<button class="btn btn-danger btn-sm" type="reset" v-if="formType === 'new'"><b-icon icon="backspace"></b-icon>&nbsp;Clear</button> 
							<button class="btn btn-danger btn-sm" @click="formCancel"><b-icon icon="x-octagon"></b-icon>&nbsp;Cancel</button>  
						</b-col></b-row>	
					</div>				
				</b-form>
			</div>
	`,
  props: {
    showForm: Boolean,
    userForm: Object,
    formType: String,
    userType: String,
    add: Function,
  },
  data() {
    return {
      status: [
        { text: 'Active', value: 1 },
        { text: 'Inactive', value: 0 },
      ],
      uForm: {},
    };
  },
  methods: {
    ...mapActions(['setLoading', 'setUsers']),
    formSubmit() {
      this.setLoading(true);
      let user = this.uForm;
      let msg = this.formType === 'new' ? 'added' : 'updated';
      axios
        .post('_api/users.php', this.uForm)
        .then(res => {
          if (res.data[0].user_id) {
            this.setUsers(res.data);
            this.$parent.setAlert(`${user.last_name} ${user.first_name} successfully ${msg}`, 'success');
          } else {
            this.$parent.setAlert(`${user.last_name} ${user.first_name} not successfully ${msg}`, 'danger');
          }
        })
        .catch(err => this.$parent.setAlert(`${err.message}`, 'danger'));
      this.formReset();
      this.setLoading(false);
    },
    formReset() {
      // Trick to reset/clear native browser form validation state
      this.$parent.showForm = false;
      this.$parent.userForm = {};
      this.uForm = {};
      let ftype = this.formType;
      this.$parent.formType = '';
      this.$nextTick(() => {
        ftype === 'new' ? this.$parent.add() : '';
      });
    },
    formCancel() {
      this.$parent.showForm = false;
      this.$parent.userForm = {};
      this.uForm = {};
      this.$parent.formType = '';
    },
  },
  watch: {
    formType(newValue, oldValue) {
      this.uForm = newValue !== oldValue ? ({...this.userForm }) : {};
    },
  },
};

const UserSettings = {
  template: `
		<div class="mt-2">
			<div class="d-flex align-items-center justify-content-around mb-2">
				<h6 class="text-success mb-0"><b-icon icon="person-lines-fill"></b-icon>
					List of {{ userType | capitalize }}s</h6>
				<b-link @click="add"><b-icon icon="person-plus-fill"></b-icon> new {{ userType }}</b-link>
			</div>
			<show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert"></show-alert>
			<user-form :user-type="userType" :form-type="formType" :user-form="userForm" :show-form="showForm" :add="add"></user-form>
			<b-table :items="curUsers" :fields="fields" primary-key="user_id" hover striped  bordered stacked="sm">				
				<template v-slot:cell(index)="{index}">{{ index + 1 }}</template>
				<template v-slot:cell(fullName)="{item: u}">{{ u.last_name }}, {{ u.first_name}} {{ u.mid_name }}</template>
				<template v-slot:head(actions)={label}>
				<b-icon icon="tools"></b-icon> {{ label }}</template>		
				<template v-slot:cell(actions)="{item: u}">
					<b-link variant="success" class="text-nowrap" @click="edit(u)"><b-icon icon="pencil"></b-icon>edit</b-link> . 
					<b-link variant="success" class=" text-nowrap" @click="del(u)"><b-icon icon="trash"></b-icon>del</b-link>
				</template>	
			</b-table>
		</div>
	`,
  components: { 'user-form': UserForm },
  mixins: [alertMixin],
  data() {
    return {
      fields: [
        { key: 'index', label: 'S/N' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'reg_num', label: 'User ID' },
        'actions',
      ],
      userForm: {},
      showForm: false,
      formType: '',
    };
  },
  computed: {
    ...mapState(['users']),
    ...mapGetters(['deptId']),
    userType() {
      return this.$route.params.utype;
    },
    curUsers() {
      let filteredUsers = [];
      if (this.userType === 'admin') {
        filteredUsers = [...this.users.filter(u => parseInt(u.is_admin, 10) === 1)];
      } else if (this.userType === 'user') {
        filteredUsers = [...this.users.filter(u => parseInt(u.is_admin, 10) === 0)];
      }
      return filteredUsers;
    },
  },
  methods: {
    ...mapActions(['setLoading', 'setUsers']),
    add() {
      this.userForm = {};
      this.userForm.is_admin = this.userType === 'admin' ? 1 : 0;
      this.userForm.active = 1;
      this.userForm.dept_id = this.deptId;
      this.userForm.user_id = '';
      this.formType = 'new';
      this.showForm = true;
    },
    edit(user) {
      this.userForm = {...user };
      this.formType = 'edit';
      this.showForm = true;
      scroll(0, 0);
    },
    del(user) {
      let ok = confirm(`Are sure you want to delete ${user.last_name} ${user.first_name}?`);
      if (ok) {
        this.setLoading(true);
        axios
          .delete(`_api/users.php?${user.user_id}`)
          .then(res => {
            if (res.data[0].user_id) {
              this.setUsers(res.data);
              this.setAlert(`${user.last_name} ${user.first_name} successfully deleted`, 'success');
            } else {
              this.setAlert(`${user.last_name} ${user.first_name} not successfully deleted`, 'danger');
            }
          })
          .catch(err => this.setAlert(`${err.message}`, 'danger'));
        this.setLoading(false);
        scroll(0, 0);
      }
    },
  },
};

const QuestionsTable = {
  template: `				
		<b-table :items="questions" :fields="fields" primary-key="qid" hover striped  bordered :stacked="stacked" small selectable :selected-variant="variant" @row-selected="onRowSelected">				
			<template v-slot:cell(index)="{index}">
			{{ index + 1 }}
			</template>				
			<template v-slot:head(actions)={label}>
			<b-icon icon="tools"></b-icon> {{ label }}</template>	
			<template v-slot:cell(actions)="{item: q}">
				<b-link class="text-nowrap" @click="edit(q)"><b-icon icon="pencil"></b-icon>edit</b-link> . 
				<b-link class=" text-nowrap" @click="del(q)"><b-icon icon="trash"></b-icon>del</b-link>
			</template>
			<template #cell(question)="{item: q}">{{ q.questn.question }}</template>
			<template v-if="questnType==='pic'" #cell(picture)="{value, index}"><b-img :src="value" :alt="'picture ' + (index + 1 )" fluid></b-img></template>	
			<template v-else v-for="optN in 5" v-slot:[cells[optN-1]]="{item:a}">
				{{ a.questn.options[optN-1].option }} <i class="d-block" :class="formatClass(a.questn.options[optN-1].ans)">{{ formatAnswer(a.questn.options[optN-1].ans) }}</i>
			</template>
			<template v-slot:cell(active)="{item, selectRow, unselectRow}">
			{{ +item.active === 1 ? selectRow(): unselectRow()  }}       
				<b-form-checkbox v-model="item.active" value="1" unchecked-value="0" switch></b-form-checkbox>
      </template>
    </b-table>    
	`,
  props: {
    questnType: String,
    questions: Array,
    onRowSelected: Function,
    edit: Function,
    del: Function,
  },
  data() {
    return {
      cells: ['cell(opt1)', 'cell(opt2)', 'cell(opt3)', 'cell(opt4)', 'cell(opt5)'],
    };
  },
  computed: {
    fields() {
      switch (this.questnType) {
        case 'pic':
          return [{ key: 'index', label: 'S/N' }, 'active', 'picture', 'question', 'actions'];
        default:
          return [
            { key: 'index', label: 'S/N' },
            'active',
            { key: 'question', label: 'Question' },
            { key: 'opt1', label: 'Option A' },
            { key: 'opt2', label: 'Option B' },
            { key: 'opt3', label: 'Option C' },
            { key: 'opt4', label: 'Option D' },
            { key: 'opt5', label: 'Option E' },
            'actions',
          ];
      }
    },
    stacked() {
      switch (this.questnType) {
        case 'pic':
          return 'sm';
        default:
          return 'xl';
      }
    },
    variant() {
      switch (this.questnType) {
        case 'tof':
          return 'success';
        default:
          return '';
      }
    },
  },
  methods: {
    formatClass(value) {
      switch (this.questnType) {
        case 'bop':
          return +value === 1 ? 'text-success' : 'text-danger';
        default:
          return 'text-success';
      }
    },
    formatAnswer(value) {
      switch (this.questnType) {
        case 'bop':
          return 'Ans: ' + (+value === 1 ? 'Yes' : 'No');
        default:
          return 'Ans: ' + (+value === 1 ? 'true' : 'false');
      }
    },
  },
};

const QuestionForm = {
  template: `
		<div class="mt-2 mb-2 p-2 border-bottom shadow" v-if="showForm">
			<b-form @submit.prevent="formSubmit()" @reset.prevent="formReset">
				<div class="d-flex flex-column">
					<h6 class="text-success text-center" v-if="formType === 'new'"><b-icon icon="plus"></b-icon> New {{ questnTitle }}</h6>
					<h6 class="text-success text-center" v-else><b-icon icon="pencil-square"></b-icon> Edit {{ questnTitle }}</h6>

					<b-form-group label="Question:" label-for="question" label-cols="12" label-cols-md="auto">	
						<b-form-textarea size="sm" max-rows="10" id="question" v-model="qForm.questn.question" trim required autofocus></b-form-textarea>				
					</b-form-group>
					<div v-if="questnType=== 'pic'" class="mb-2">
            <b-row v-if="newPicture">
              <b-col cols="12" md="7" xl="6"> 
                <b-form-group  label="Picture:" label-for="picture" label-cols="12" label-cols-sm="auto" description="Choose or drag & drop picture here.">	
                  <b-form-file size="lg" :browse-text="qForm.file ? 'Change' : 'Choose'" id="picture" v-model="qForm.file" @input="getImage" placeholder="No picture chosen" drop-placeholder="Drop picture here" accept="image/*" required>
                    <template v-slot:file-name="{ names }">
                      <b-badge variant="success">{{ names[0] }}</b-badge>
                    </template>
                  </b-form-file>											
                </b-form-group>
                <b-button v-if="replacePicture" variant="danger" size="sm" @click="cancelPictureReplace"><b-icon icon="x"></b-icon> Cancel</b-button>	
              </b-col>
                <b-col cols="12" md="5" xl="6">              
                  <b-img :src="pictureSrc" alt="" aria-label="Image Preview" fluid></b-img> 
                </b-col>
              </b-row>  
						</b-row>
						<div v-else>
							<b-img :src="qForm.picture" width="200"></b-img>
							<b-button variant="success" size="sm" @click="replacePicture=true"><b-icon icon="pencil"></b-icon> Replace</b-button>
						</div>
					</div>

					<b-row v-else align-v="center" v-for="(opt, index) in qForm.questn.options" :key="opt.id">
						<b-col cols="12" md="10">
							<b-form-group :label="options[index] + ':'" :label-for="opt.id" label-cols="12" label-cols-md="auto">
								<b-form-textarea size="sm" max-rows="10" :id="opt.id" v-model="qForm.questn.options[index].option" trim required></b-form-textarea>
							</b-form-group>
						</b-col> 
						<b-col cols="12" md="2">
							<b-form-group label="Answer" label-align="center">
								<b-input-group prepend="F" append="T" class="flex-nowrap justify-content-center">&nbsp;	
									<b-form-checkbox v-model="qForm.questn.options[index].ans" value="1" unchecked-value="0" @change="checkAnsSel(opt.id)" switch></b-form-checkbox>
								</b-input-group>
							</b-form-group>
						</b-col> 
					</b-row>

					<b-row>
						<b-col cols="12" md="5" lg="4" xl="3">
							<b-form-group label="Status:" label-for="status" label-cols="auto">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="shuffle"></b-icon></b-input-group-prepend>
									<b-form-select id="status" v-model="qForm.active" :options="status" required number></b-form-select>
							</b-input-group>
							</b-form-group>
						</b-col>
						<b-col class="text-center">
							<button class="btn btn-success btn-sm" type="submit"><b-icon icon="cursor"></b-icon>&nbsp;{{ formType === 'new' ? 'Add' : 'Save Changes' }}</button> &nbsp; 
							<button class="btn btn-danger btn-sm" type="reset" v-if="formType === 'new'"><b-icon icon="backspace"></b-icon>&nbsp;Clear</button> 
							<button class="btn btn-danger btn-sm" @click="formCancel"><b-icon icon="x-octagon"></b-icon>&nbsp;Cancel</button>  
						</b-col>
					</b-row>
				</div>
			</b-form>
		</div>
	`,
  props: {
    showForm: Boolean,
    questnForm: Object,
    formType: String,
    questnType: String,
  },
  data() {
    return {
      options: ['Option A', 'Option B', 'Option C', 'Option D', 'Option E'],
      replacePicture: false,
      pictureSrc: null,
      status: [
        { text: 'Active', value: 1 },
        { text: 'Inactive', value: 0 },
      ],
      qForm: {},
    };
  },
  computed: {
    newPicture() {
      return this.formType === 'new' || this.replacePicture === true ? true : false;
    },
    questnTitle() {
      let title = { bop: 'Best Option Question', tof: 'True or False Question', pic: 'Picture Question' };
      return title[this.questnType];
    },
  },
  methods: {
    ...mapActions(['setLoading', 'setQuestnsBop', 'setQuestnsTof', 'setQuestnsPic']),
    cancelPictureReplace() {
      this.replacePicture = false;
      this.qForm.file = null;
    },
    checkAnsSel(id) {
      if (this.questnType === 'bop') {
        this.qForm.questn.options.map(a => (a.id !== id ? (a.ans = 0) : a));
      }
    },
    formSubmit() {
      this.setLoading(true);
      if (this.questnType === 'bop') {
        ansSel = this.qForm.questn.options.some(a => +a.ans === 1);
        if (!ansSel) {
          this.$parent.setAlert(`No answer selected. Please select one answer`, 'danger');
          this.setLoading(false);
          scroll(0, 0);
          return false;
        }
      }
      let msg = this.formType === 'new' ? 'added' : 'updated';
      let url = 'questions_' + this.questnType;
      let setAction = 'setQuestns' + ucword(this.questnType);
      let data = {...this.qForm };
      let config = {};

      if (this.questnType === 'pic') {
        let df = {...this.qForm };
        data = new FormData();
        data.append('qid', df.qid);
        data.append('questn_type', df.questn_type);
        data.append('questn', JSON.stringify(df.questn));
        data.append('dept_id', df.dept_id);
        data.append('active', '' + df.active);
        data.append('file', df.file);
        data.append('picture', df.picture);
        config = { header: { 'Content-Type': 'multipart/form-data' } };
      }

      axios
        .post(`_api/${url}.php`, data, config)
        .then(res => {
          if (res.data[0].qid) {
            this[setAction](res.data);
            this.$parent.setAlert(`Question(s) successfully ${msg}`, 'success');
          } else {
            this.$parent.setAlert(`Question(s) not successfully ${msg}`, 'danger');
          }
        })
        .catch(err => this.$parent.setAlert(`${ err.message }`, 'danger'));
      this.pictureSrc = null;
      this.formReset();
      this.setLoading(false);
      scroll(0, 0);
    },
    formReset() {
      // Trick to reset/clear native browser form validation state
      this.$parent.showForm = false;
      this.replacePicture = false;
      this.$parent.questnForm = {};
      this.qForm = {};
      let ftype = this.formType;
      this.$parent.formType = '';
      this.$nextTick(() => {
        ftype === 'new' ? this.$parent.add() : '';
      });
    },
    formCancel() {
      this.$parent.showForm = false;
      this.replacePicture = false;
      this.$parent.questnForm = {};
      this.qForm = {};
      this.$parent.formType = '';
    },
    getImage(file) {
      this.setLoading(true);
      // console.log('qfile: ', this.qForm.file);
      const reader = new FileReader();
      reader.addEventListener(
        'load',
        () => {
          // console.log('reader loaded: ', reader);

          this.pictureSrc = reader.result;
        },
        false
      );
      if (file) {
        reader.readAsDataURL(file);
      }
      this.setLoading(false);
    },
  },
  watch: {
    formType(newValue, oldValue) {
      this.qForm = newValue !== oldValue ? {...this.questnForm } : {};
    },
  },
};

const ConvertDataurl = {
  template: `
		<div class="mt-2 mb-2 p-2 border-bottom shadow">
			<b-form @submit.prevent="">
				<div class="d-flex flex-column">					
					<h6 class="text-success text-center"><b-icon icon="arrow-repeat"></b-icon> Convert Image to DataURL</h6>
					<b-form-group label="DataURL:" label-for="dataurl">	
						<b-form-textarea max-rows="20" id="dataurl" v-model="dataurl" trim required></b-form-textarea>				
					</b-form-group>
          <b-form-group  label="Image:" label-for="image"  description="Choose or drag & drop image here.">	
            <b-form-file size="lg" :browse-text="qfile ? 'Change' : 'Choose'"  v-model="qfile" id="image" @input="getImage" placeholder="No image chosen" drop-placeholder="Drop image here" accept="image/*" required>
              <template v-slot:file-name="{ names }">
                <b-badge variant="success">{{ names[0] }}</b-badge>
              </template>
            </b-form-file>											
          </b-form-group>
          <div class="bg-success p-2"><img  :src="dataurl" alt="" width="200" ></div>
				</div>
			</b-form>
		</div>
  `,
  data() {
    return {
      dataurl: null,
      qfile: null,
    };
  },
  methods: {
    getImage(file) {
      const reader = new FileReader();
      reader.addEventListener(
        'load',
        () => {
          // console.log('reader loaded: ', reader);
          this.dataurl = reader.result;
        },
        false
      );
      if (file) {
        reader.readAsDataURL(file);
      }
    },
  },
};

const QuestionSettings = {
  template: `
		<div class="mt-2">
			<div class="d-flex align-items-center justify-content-around mb-1 border-bottom">						
				<h6 class="text-success mb-0">
					<b-icon icon="question-octagon-fill"></b-icon> {{ questnTitle }}
				</h6>			
        <b-nav tabs>
          <b-nav-item @click="selectCase='bank'" :active="selectCase==='bank'">bank</b-nav-item>
          <b-nav-item @click="selectCase='active'" :active="selectCase==='active'">active</b-nav-item>
          <b-nav-item v-show="showActions" @click="add"><b-icon icon="plus"></b-icon> new question</b-nav-item>
        </b-nav>
			</div>
			<show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert"></show-alert>
			<question-form :questn-type="questnType" :form-type="formType" :questn-form="questnForm" :show-form="showForm"></question-form>
			<div class="d-flex align-items-center justify-content-around mb-1">	
        <b-nav tabs>
          <b-nav-text class="text-success font-weight-bold pr-1">Selected: <b-badge variant="success">{{ selected.length }}</b-badge> </b-nav-text>
          <b-nav-item v-show="showActions" @click="selectAllRows">Select all</b-nav-item>
          <b-nav-item v-show="showActions" @click="clearSelected">Unselect all</b-nav-item>
        </b-nav>
        <b-nav tabs v-show="showActions">
          <b-nav-item @click="saveChanges('update')">Save Changes</b-nav-item>
          <b-nav-item @click="saveChanges('delete')"><span class="text-danger">Delete Selected</span></b-nav-item>
          <b-nav-item @click="saveChanges('deleteAll')"><span class="text-danger">Delete All</span></b-nav-item>
        </b-nav>
			</div>
			<questions-table :questions="questions" :onRowSelected="onRowSelected" :edit="edit" :del="del" :questn-type="questnType"></questions-table>
		</div>
	`,
  mixins: [alertMixin],
  components: { 'questions-table': QuestionsTable, 'question-form': QuestionForm },
  data() {
    return {
      selected: [],
      selectCase: 'bank',
      formType: '',
      showForm: false,
      questnForm: {},
    };
  },
  computed: {
    ...mapState(['questnsBop', 'questnsTof', 'questnsPic']),
    ...mapGetters(['deptId']),
    questnType() {
      return this.$route.params.qtype;
    },
    questnTitle() {
      let title = { bop: 'Best Option Questions', tof: 'True or False Questions', pic: 'Picture Questions' };
      return title[this.questnType];
    },
    questions() {
      let qtype = 'questns' + ucword(this.questnType);
      activeQuestn = this[qtype];
      switch (this.selectCase) {
        case 'selectAll':
          activeQuestn.map(q => (q.active = 1));
          break;
        case 'clearSelected':
          activeQuestn.map(q => (q.active = 0));
          break;
        case 'active':
          activeQuestn = activeQuestn.filter(q => +q.active === 1);
          break;
        default:
          break;
      }
      return activeQuestn;
    },
    showActions() {
      return this.selectCase !== 'active';
    },
  },
  methods: {
    ...mapActions(['setLoading', 'setQuestnsBop', 'setQuestnsTof', 'setQuestnsPic']),
    add() {
      this.questnForm = {};
      this.questnForm.active = 0;
      this.questnForm.dept_id = this.deptId;
      this.questnForm.qid = '';
      this.questnForm.questn_type = this.questnType;
      this.questnForm.questn = { question: '', options: [] };
      for (let i = 0; i < 5; i++) {
        this.questnForm.questn.options[i] = { id: 'a' + uuidv4(), option: '', ans: 0 };
      }
      this.formType = 'new';
      this.showForm = true;
    },
    edit(questn) {
      this.questnForm = {...questn };
      this.formType = 'edit';
      this.showForm = true;
      scroll(0, 0);
    },
    del(questn) {
      let ok = confirm('Are sure you want to delete the question(s)?');
      if (ok) {
        this.setLoading(true);
        let url = 'questions_' + this.questnType;
        let setAction = 'setQuestns' + ucword(this.questnType);
        axios
          .delete(`_api/${url}.php?${questn.qid}`)
          .then(res => {
            if (res.data[0].qid) {
              this[setAction](res.data);
              this.setAlert('Question(s) successfully deleted.', 'success');
            } else {
              this.setAlert('Question(s) not successfully deleted', 'danger');
            }
          })
          .catch(err => this.setAlert(`${err.message}`, 'danger'));
        this.setLoading(false);
        scroll(0, 0);
      }
    },
    onRowSelected(items) {
      this.selected = items;
    },
    clearSelected() {
      this.selectCase = 'clearSelected';
    },
    selectAllRows() {
      this.selectCase = 'selectAll';
    },
    saveChanges(changeType) {
      this.setLoading(true);
      let url = 'questions_' + this.questnType;
      let setAction = 'setQuestns' + ucword(this.questnType);
      let data = { questions: this.selected, type: changeType, qtype: this.questnType };
      axios
        .put(`_api/${url}.php`, data)
        .then(res => {
          // console.log(res.data);
          if (changeType === 'deleteAll') {
            res.data.length === 0 ? this[setAction]([]) : '';
            this.setAlert(`All question(s) deleted successfully`, 'success');
          } else if (res.data[0].qid) {
            this[setAction](res.data);
            let msg = changeType === 'update' ? 'Changes saved' : 'Question(s) deleted';
            this.setAlert(`${msg} successfully`, 'success');
          } else {
            let msg = changeType === 'update' ? 'Changes not saved' : 'Question(s) not deleted';
            this.setAlert(`${msg} successfully`, 'danger');
          }
        })
        .catch(err => this.setAlert(`${err.message}`, 'danger'));
      this.setLoading(false);
      scroll(0, 0);
    },
  },
};

const MigrateQuestion = {
  template: `
		<div class="mt-2">
			<div class="d-flex align-items-center justify-content-around mb-1 border-bottom">						
				<h5 class="text-success mb-0">
					<b-icon icon="question-octagon-fill"></b-icon> Migrate Questions
				</h5>
				<div>
					<b-link @click="qtype = 'bop'">bop</b-link> .
					<b-link @click="qtype = 'tof'">tof</b-link> .
					<b-link @click="qtype = 'pic'">pic</b-link>
				</div>				
			</div>
			<show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert"></show-alert>
			<div class="mt-2 mb-2 p-2 border-bottom shadow">
				<h5 class="text-success text-center mb-1">{{  qtitle }}</h5>
				<b-form @submit.prevent="formSubmit()">
					<div class="d-flex flex-column">	
						<b-row>							
							<b-col class="text-center">
								<button class="btn btn-success btn-sm" type="submit"><b-icon icon="cursor"></b-icon> Migrate</button>  
							</b-col>
						</b-row>
					</div>
				</b-form>
			</div>
		</div>
	`,
  mixins: [alertMixin],
  data() {
    return {
      title: { bop: 'Best Option Questions', tof: 'True or False Questions', pic: 'Picture Questions' },
      qtype: 'bop',
      qForm: {},
    };
  },
  computed: {
    ...mapState(['questnsBop', 'questnsTof', 'questnsPic']),
    questions() {
      return this['questns' + ucword(this.qtype)];
    },
    qtitle() {
      return this.title[this.qtype];
    },
  },
  methods: {
    ...mapActions(['setLoading']),
    formSubmit() {
      this.setLoading(true);
      let questns = [];
      this.questions.forEach(q => {
        questns.push({
          questn: JSON.stringify({
            question: q.question,
            options: [
              { id: 'a' + uuidv4(), option: q.opt1, ans: q.ans1 },
              { id: 'b' + uuidv4(), option: q.opt2, ans: q.ans2 },
              { id: 'c' + uuidv4(), option: q.opt3, ans: q.ans3 },
              { id: 'd' + uuidv4(), option: q.opt4, ans: q.ans4 },
              { id: 'e' + uuidv4(), option: q.opt5, ans: q.ans5 },
            ],
          }),
        });
      });
      this.qForm.questions = [...questns];
      this.qForm.qtype = this.qtype;
      axios
        .post('_api/migrate.php', this.qForm)
        .then(res => {
          console.log(res.data);
          if (res.data.ok) {
            this.setAlert('Question migrated successfully', 'success');
          } else {
            this.setAlert('No question migrated', 'danger');
          }
        })
        .catch(err => console.error(err));
      this.setLoading(false);
    },
  },
};


const SetupForm = {
  template: `
		<div class="mt-2 mb-2 border-bottom border-top shadow p-2" v-if="showForm">
			<b-form @submit.prevent="formSubmit()">
				<div class="d-flex flex-column">
					<h4 class="text-success text-center" v-if="formType === 'new'">
					<b-icon icon="person-plus-fill"></b-icon> New {{ setupTitle }}</h4>
					<h4 class="text-success text-center" v-else>
					<b-icon icon="pencil-square"></b-icon> Edit {{ setupTitle }}</h4>
					<b-row>
						<b-col cols="12" sm="6" lg="3">
							<b-form-group label="Type" label-for="category">
								<b-form-select placeholder="Please Select..." id="category" v-model="sForm.category" :options="categories" text-field="cat_name" value-field="cat_name" required number>
									<template #first>
										<b-form-select-option value="" disabled>Please select...</b-form-select-option> 										
									</template>
								</b-form-select>
							</b-form-group>
						</b-col>
						<b-col cols="12" sm="6" lg="3">
							<b-form-group label="Total Questions" label-for="totalQuestion">
								<b-form-input type="number" placeholder="0" id="totalQuestion" v-model="sForm.total_questns" number required autofocus></b-form-input>
							</b-form-group>
						</b-col>
						<b-col cols="12" sm="6" lg="3">
							<b-form-group label="Questions Per Page" label-for="perPage">
								<b-form-input type="number" placeholder="0" id="perPage" v-model="sForm.questns_per_page" number required></b-form-input>	
							</b-form-group>
						</b-col> 
						<b-col cols="12" sm="6" lg="3">
						<b-form-group label="Pass Mark" label-for="passMark">	
							<b-input-group append="%">							
								<b-form-input type="number" id="passMark" v-model="sForm.pass_mark" number required></b-form-input>	
								</b-input-group>							
						</b-form-group>
						</b-col> 
					</b-row>
					<b-row>
						<b-col cols="12" sm="6" lg="3">
							<b-form-group label-for="negativeMark">
								<template v-slot:label>
									Negative Marking: {{ sForm.negative_marking }}
								</template>
								<b-input-group prepend="0" append="1">						
									<b-form-input type="range" id="negativeMark" v-model="sForm.negative_marking" min="0" max="1" step="0.01"  required number></b-form-input>	
								</b-input-group>							
							</b-form-group>
						</b-col>
						<b-col cols="12" sm="6" lg="3">
							<b-form-group label="Hours" label-for="hrs">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="stopwatch-fill"></b-icon></b-input-group-prepend>								
									<b-form-input type="number" placeholder="0" id="hrs" v-model="sForm.hrs" number required></b-form-input>
								</b-input-group>								
							</b-form-group>
						</b-col>
						<b-col cols="12" sm="6" lg="3">
							<b-form-group label="Minutes" label-for="mins">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="stopwatch-fill"></b-icon></b-input-group-prepend>								
									<b-form-input type="number" placeholder="0" id="mins" v-model="sForm.mins" number required></b-form-input>
								</b-input-group>								
							</b-form-group>
						</b-col>
						<b-col cols="12" sm="6" lg="3"><b-form-group label="Status" label-for="status">
							<b-input-group>
								<b-input-group-prepend is-text><b-icon icon="shuffle"></b-icon></b-input-group-prepend>
								<b-form-select id="status" v-model="sForm.active" :options="status" required number></b-form-select>
							</b-input-group>
						</b-form-group></b-col>
					</b-row>
					<b-row align-h="center"><b-col cols="auto">
						<button class="btn btn-success btn-sm" type="submit"><b-icon icon="cursor"></b-icon> {{ formType === 'new' ? 'Add' : 'Save Changes' }}</button> &nbsp;
						<button class="btn btn-danger btn-sm" @click="formCancel"><b-icon icon="x-octagon"></b-icon> Cancel</button>  
					</b-col></b-row>	
				</div>				
			</b-form>		
		</div>
	`,
  props: {
    setupType: String,
    formType: String,
    setupForm: Object,
    showForm: Boolean,
  },
  data() {
    return {
      status: [
        { text: 'Active', value: 1 },
        { text: 'Inactive', value: 0 },
      ],
      sForm: {},
    };
  },
  computed: {
    ...mapState(['categories']),
    setupTitle() {
      let title = { bop: 'Best Option Setup', tof: 'True or False Setup', pic: 'Picture Setup' };
      return title[this.setupType];
    },
  },
  methods: {
    ...mapActions(['setLoading', 'setSetup']),
    formSubmit() {
      let msg = this.formType === 'new' ? 'added' : 'updated';
      axios
        .post('_api/setup.php', this.sForm)
        .then(res => {
          if (res.data[0].setup_id) {
            this.setSetup(res.data);
            this.$parent.setAlert(`Setup(s) successfully ${msg}`, 'success');
          } else {
            this.$parent.setAlert(`Setup(s) not successfully ${msg}`, 'danger');
          }
        })
        .catch(err => this.$parent.setAlert(`${ err.message }`, 'danger'));
      this.formCancel()
      this.setLoading(false);
      scroll(0, 0);
    },
    formCancel() {
      this.$parent.showForm = false;
      this.$parent.setupForm = {};
      this.$parent.formType = '';
    },
  },
  watch: {
    formType(newValue, oldValue) {
      this.sForm = newValue !== oldValue ? ({...this.setupForm }) : {};
    },
  },
};

const SetupSettings = {
  template: `
		<div class="mt-2">
			<div class="d-flex align-items-center justify-content-around mb-1">						
				<h6 class="text-success">
					<b-icon icon="tools"></b-icon> {{ setupTitle }}
				</h6>				
				<b-link @click="add"><b-icon icon="plus-circle-fill"></b-icon> new</b-link>
			</div>
			<show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert"></show-alert>
			<setup-form :setup-type="setupType" :form-type="formType" :setup-form="setupForm" :show-form="showForm"></setup-form>			
			<b-table :items="setups" :fields="fields" primary-key="setup_id" hover striped  bordered stacked="lg" small>				
				<template v-slot:cell(index)="{index}">{{ index + 1 }}</template>				
				<template v-slot:head(actions)={label}>
					<b-icon icon="tools"></b-icon> {{ label }}</template>	
				<template v-slot:cell(actions)="{item: s}">
					<b-link class="text-nowrap" @click="edit(s)"><b-icon icon="pencil"></b-icon>edit</b-link> . 
					<b-link class=" text-nowrap" @click="del(s)"><b-icon icon="trash"></b-icon>del</b-link>
				</template>
			</b-table>			
		</div>
	`,
  components: { 'setup-form': SetupForm },
  mixins: [alertMixin],
  data() {
    return {
      setupForm: {},
      showForm: false,
      formType: '',
      fields: [
        { key: 'index', label: 'S/N' },
        { key: 'created_on', label: 'Period', formatter: 'periodFormatter' },
        { key: 'total_questns', label: 'Total Questions' },
        { key: 'questns_per_page', label: 'Questions Per Page' },
        'negative_marking',
        { key: 'pass_mark', formatter: value => '' + value + '%' },
        { key: 'category', label: 'Type' },
        { key: 'hrs', label: 'Hours' },
        { key: 'mins', label: 'Minutes' },
        { key: 'active', label: 'Status', formatter: value => (+value === 1 ? 'Active' : 'Inactive') },
        'actions',
      ],
    };
  },
  computed: {
    ...mapState(['setup']),
    ...mapGetters(['deptId']),
    setupType() {
      return this.$route.params.stype;
    },
    setupTitle() {
      let title = { bop: 'Best Option Setup', tof: 'True or False Setup', pic: 'Picture Setup' };
      return title[this.setupType];
    },
    setups() {
      return this.setup.filter(s => s.questn_type === this.setupType);
    },
  },
  methods: {
    ...mapActions(['setLoading', 'setSetup', ]),
    periodFormatter(value) {
      const fp = n => (+n < 10 ? '0' + n : n);
      let p = new Date(value);
      let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let wd = days[p.getDay()]
      let day = fp(p.getDate());
      let month = fp(p.getMonth() + 1);
      let year = p.getFullYear();
      let sec = fp(p.getSeconds());
      let min = fp(p.getMinutes());
      let hr = p.getHours();
      let ampm = hr > 11 ? 'PM' : 'AM';
      hr = fp(hr % 12 || 12);
      return `${wd} ${day}|${month}|${year} ${hr}:${min}:${sec} ${ampm}`;
    },
    add() {
      this.setupForm = {};
      this.setupForm.active = 0;
      this.setupForm.hrs = 0;
      this.setupForm.pass_mark = 50;
      // this.setupForm.negative_marking = '0.00';
      this.setupForm.category = '';
      this.setupForm.dept_id = this.deptId;
      this.setupForm.questn_type = this.setupType;
      this.setupForm.setup_id = '';
      this.formType = 'new';
      this.showForm = true;
    },
    edit(setup) {
      this.setupForm = {...setup };
      this.formType = 'edit';
      this.showForm = true;
      scroll(0, 0);
    },
    del(setup) {
      let ok = confirm(`Are you sure you want to delete the setup(s)?`);
      if (ok) {
        this.setLoading(true);
        axios
          .delete(`_api/setup.php?${setup.setup_id}`)
          .then(res => {
            if (res.data[0].setup_id) {
              this.setSetup(res.data);
              this.setAlert(`Setup(s) successfully deleted`, 'success');
            } else {
              this.setAlert(`Setup(s) not successfully deleted`, 'danger');
            }
          })
          .catch(err => this.setAlert(`${err.message}`, 'danger'));
        this.setLoading(false);
        scroll(0, 0);
      }
    },
  },
};

const ResultForm = {
  template: `	
		<div class="mt-2 mb-2 border-bottom border-top shadow p-2" v-if="showForm">
			<b-form @submit.prevent="formSubmit()">
				<div class="d-flex flex-column">
					<h4 class="text-success text-center">
					<b-icon icon="pencil-square"></b-icon> Edit {{ resultTitle }}</h4>
					<b-row>
						<b-col cols="12" md="6">
							<b-form-group label="Full Name" label-for="fullName">
								<b-input-group>
									<b-input-group-prepend is-text><b-icon icon="person-bounding-box"></b-icon></b-input-group-prepend>
									<b-form-input id="fullName" v-model="rForm.fullName" required trim readonly></b-form-input>
								</b-input-group>
							</b-form-group>
						</b-col>
						<b-col cols="12" md="6">
							<b-form-group label="Total Questions" label-for="totalQuestion">
								<b-form-input type="number" id="totalQuestion" v-model="rForm.questns_total" number required></b-form-input>
							</b-form-group>
						</b-col>
						</b-row>
						<b-row>
						<b-col cols="12" sm="6" lg="3">
							<b-form-group label="Questions Answered" label-for="answered">
								<b-form-input type="number" id="answered" v-model="rForm.questns_answered" number required></b-form-input>	
							</b-form-group>
						</b-col> 
						<b-col cols="12" sm="6" lg="3">
							<b-form-group label="Questions Unanswered" label-for="unanswered">
								<b-form-input type="number" id="unanswered" v-model="rForm.questns_unanswered" number required></b-form-input>	
							</b-form-group>
						</b-col> 
						<b-col cols="12" sm="6" lg="3">
							<b-form-group label="Questions Passed" label-for="passed">
								<b-form-input type="number" id="passed" v-model="rForm.questns_passed" number required></b-form-input>	
							</b-form-group>
						</b-col> 
						<b-col cols="12" sm="6" lg="3">
							<b-form-group label="Questions Failed" label-for="failed">
								<b-form-input type="number" id="failed" v-model="rForm.questns_failed" number required></b-form-input>	
							</b-form-group>
						</b-col> 
					</b-row>
					<b-row>
						<b-col cols="12" sm="6" md="4">
							<b-form-group label="Initial Score" label-for="initialScore">	
								<b-input-group append="%">						
									<b-form-input type="number" id="initialScore" v-model="rForm.initial_score" required number></b-form-input>	
								</b-input-group>							
							</b-form-group>
						</b-col>
						<b-col cols="12" sm="6" md="4">
							<b-form-group label="Final Score" label-for="finalScore">									
								<b-input-group append="%">						
									<b-form-input type="number" id="finalScore" v-model="rForm.final_score" required number></b-form-input>	
								</b-input-group>							
							</b-form-group>
						</b-col>							
						<b-col cols="12" sm="6" md="4"><b-form-group label="Remark" label-for="status">
							<b-input-group>
								<b-input-group-prepend is-text><b-icon icon="shuffle"></b-icon></b-input-group-prepend>
								<b-form-select id="status" v-model="rForm.pass" :options="status" required number></b-form-select>
							</b-input-group>
						</b-form-group></b-col>
					</b-row>
					<b-row align-h="center"><b-col cols="auto">
						<button class="btn btn-success btn-sm" type="submit"><b-icon icon="cursor"></b-icon> Save Changes</button> &nbsp;
						<button class="btn btn-danger btn-sm" @click="formCancel"><b-icon icon="x-octagon"></b-icon> Cancel</button>  
					</b-col></b-row>	
				</div>				
			</b-form>			
		</div>
	`,
  props: {
    resultType: String,
    resultForm: Object,
    showForm: Boolean,
  },
  data() {
    return {
      rForm: {},
      status: [
        { text: 'Passed', value: 1 },
        { text: 'Failed', value: 0 },
      ],
    };
  },
  computed: {
    resultTitle() {
      let title = { bop: 'Best Option Results', tof: 'True or False Results', pic: 'Picture Results' };
      return title[this.resultType];
    },
  },
  methods: {
    ...mapActions(['setLoading', 'setAnswersBop', 'setAnswersTof', 'setAnswersPic']),
    formSubmit() {
      this.setLoading(true);
      let url = 'answers_' + this.resultType;
      let setAction = 'setAnswers' + ucword(this.resultType);
      axios
        .put(`_api/${url}.php`, this.rForm)
        .then(res => {
          if (res.data[0].ans_id) {
            this[setAction](res.data);
            this.$parent.setAlert(`Result(s) successfully updated`, 'success');
          } else {
            this.$parent.setAlert(`Result(s) not successfully updated`, 'danger');
          }
        })
        .catch(err => this.$parent.setAlert(`${err.message}`, 'danger'));
      this.formCancel();
      this.setLoading(false);
    },
    formCancel() {
      this.$parent.resultForm = {};
      this.$parent.showForm = false;
    },
  },
  watch: {
    showForm(newValue) {
      this.rForm = newValue ? {...this.resultForm } : {};
    }
  }
};

const ResultSettings = {
  template: `
		<div class="mt-2">
			<div class="d-flex align-items-center justify-content-around mb-1">						
				<h6 class="text-success mb-0 pr-1">
					<b-icon icon="list-check"></b-icon> {{ resultTitle }}
        </h6>
        <b-nav tabs>
          <b-nav-item @click="summary=true" :active="summary">summary</b-nav-item>
          <b-nav-item @click="summary=false" :active="!summary">detail</b-nav-item>
          <b-nav-item @click="filterResult='passed'" :active="filterResult==='passed'">passed</b-nav-item>
          <b-nav-item @click="filterResult='failed'" :active="filterResult==='failed'">failed</b-nav-item>
          <b-nav-item @click="filterResult='all'" :active="filterResult==='all'">all</b-nav-item>
        </b-nav>
			</div>
			<show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert"></show-alert>
			<result-form :result-type="resultType" :result-form="resultForm" :show-form="showForm"></result-form>
			<b-table :items="results" :fields="fields" primary-key="ans_id" hover striped  bordered stacked="lg" small>				
				<template v-slot:cell(index)="{index}">{{ index + 1 }}</template>				
				<template v-slot:head(actions)={label}>
					<b-icon icon="tools"></b-icon> {{ label }}</template>	
				<template v-slot:cell(actions)="{item: r}">
					<b-link class="text-nowrap" @click="edit(r)"><b-icon icon="pencil"></b-icon>edit</b-link> . 
					<b-link class=" text-nowrap" @click="del(r)"><b-icon icon="trash"></b-icon>del</b-link>
				</template>
      </b-table>
       <div class="text-center mt-1">
        <img :src="HODSign" alt="HOD Signature" id="signImg">
        <div id="signature">
          <h6 class="font-weight-bold">{{ HODName }},</h6>
          <h6 class="font-weight-400 font-italic">HOD, Department of {{ deptName }}.</h6>
        </div>
      </div>	
		</div>
	`,
  components: { 'result-form': ResultForm },
  mixins: [alertMixin],
  data() {
    return {
      summary: false,
      filterResult: 'all',
      resultForm: {},
      showForm: false,
    };
  },
  computed: {
    ...mapState(['users', 'setup', 'answersBop', 'answersTof', 'answersPic', 'department']),
    resultType() {
      return this.$route.params.rtype;
    },
    HODName() {
      return this.department.hod_name;
    },
    HODSign() {
      return this.department.hod_sign;
    },
    deptName() {
      return this.department.dept_name;
    },
    resultTitle() {
      let title = { bop: 'Best Option Results', tof: 'True or False Results', pic: 'Picture Results' };
      return title[this.resultType];
    },
    setupId() {
      let activeSetup = this.setup.find(s => +s.active === 1 && s.questn_type === this.resultType);
      return activeSetup.setup_id;
    },
    fullNames() {
      let names = {};
      this.users.map(u =>
        +u.is_admin === 0 ? (names[u.user_id] = `${u.last_name} , ${u.first_name} ${u.mid_name ? u.mid_name[0] : ''}. `) : ''
      );
      return names;
    },
    results() {
      let ansType = 'answers' + ucword(this.resultType);
      switch (this.filterResult) {
        case 'passed':
          return this[ansType].filter(a => a.setup_id === this.setupId && +a.pass === 1);
        case 'failed':
          return this[ansType].filter(a => a.setup_id === this.setupId && +a.pass === 0);
        default:
          return this[ansType].filter(a => a.setup_id === this.setupId);
      }
    },
    fields() {
      if (this.summary) {
        return [
          { key: 'index', label: 'S/N' },
          { key: 'fullName', formatter: 'formatFullName' },
          { key: 'initial_score', label: 'Initial Score' },
          { key: 'final_score', label: 'Final Score (%)' },
        ];
      } else {
        return [
          { key: 'index', label: 'S/N' },
          { key: 'fullName', formatter: 'formatFullName' },
          { key: 'questns_total', label: 'Total Questions' },
          { key: 'questns_answered', label: 'Questions Answered' },
          { key: 'questns_unanswered', label: 'Questions unanswered' },
          { key: 'questns_passed', label: 'Questions Passed' },
          { key: 'questns_failed', label: 'Questions Failed' },
          { key: 'initial_score', label: 'Initial Score' },
          { key: 'final_score', label: 'Final Score (%)' },
          { key: 'pass', label: 'Remark', formatter: value => (+value === 1 ? 'Passed' : 'Failed') },
          'actions',
        ];
      }
    },
  },
  methods: {
    ...mapActions(['setLoading', 'setAnswersBop', 'setAnswersTof', 'setAnswersPic']),
    edit(result) {
      this.resultForm = {...result };
      this.resultForm.fullName = this.fullNames[result.user_id];
      this.showForm = true;
      scroll(0, 0);
    },
    del(result) {
      let ok = confirm(`Are sure you want to delete the result(s)?`);
      if (ok) {
        this.setLoading(true);
        let url = 'answers_' + this.resultType;
        let setAction = 'setAnswers' + ucword(this.resultType);
        axios
          .delete(`_api/${url}.php?${result.ans_id}`)
          .then(res => {
            if (res.data[0].ans_id) {
              this[setAction](res.data);
              this.setAlert('Result(s) successfully deleted.', 'success');
            } else {
              this.setAlert('Result(s) not successfully deleted', 'danger');
            }
          })
          .catch(err => this.setAlert(`${err.message}`, 'danger'));
        this.setLoading(false);
        scroll(0, 0);
      }
    },
    formatFullName(value, key, item) {
      return this.fullNames[item.user_id];
    },
  },
};

const InstructionSettings = {
  template: `
		<div class="text-center text-success mb-1 mt-2">
			<h1><b-icon icon="info-square-fill" size="sm"></b-icon>Instructions</h1>		
			<show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert"></show-alert>			
				<b-form @submit.prevent="formSubmit()">
					<div class="d-flex flex-column mb-2">						
						<b-row align-v="center">
							<b-col cols="12" md="6">
								<b-form-group label="General Instruction" label-for="instruction">
									<b-form-textarea size="sm" max-rows="10" id="instruction" v-model="instForm.instruction" required trim :readonly="readonly"></b-form-textarea>
								</b-form-group>
							</b-col>
							<b-col cols="12" sm="6" md="3">
								<b-form-group label="User See Result" label-for="userSeeResult">
									<b-input-group>
										<b-input-group-prepend is-text><b-icon icon="shuffle"></b-icon></b-input-group-prepend>
										<b-form-select id="userSeeResult" v-model="instForm.user_see_result" :options="status" required number :disabled="readonly"></b-form-select>
									</b-input-group>
								</b-form-group>
							</b-col>
							<b-col cols="12" sm="6" md="3">
								<b-form-group label="User See Analysis" label-for="userSeeAnalysis">
									<b-input-group>
										<b-input-group-prepend is-text><b-icon icon="shuffle"></b-icon></b-input-group-prepend>
										<b-form-select id="userSeeAnalysis" v-model="instForm.user_see_analysis" :options="status" required number :disabled="readonly"></b-form-select>
									</b-input-group>
								</b-form-group>
							</b-col>
							</b-row>		
						<b-row align-h="center" v-if="edit">
							<b-col cols="auto">
								<button class="btn btn-success btn-sm" type="submit"><b-icon icon="cursor"></b-icon> Save Changes</button> &nbsp;
								<button class="btn btn-danger btn-sm" @click="edit=false"><b-icon icon="x-octagon"></b-icon> Cancel</button>		
							</b-col>
						</b-row>	
					</div>				
				</b-form>
				<b-link class="text-nowrap" @click="edit=true" v-if="readonly"><b-icon icon="pencil"></b-icon>edit instructions</b-link> 						
		</div>
	`,
  mixins: [alertMixin],
  data() {
    return {
      edit: false,
      status: [
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ],
    };
  },
  computed: {
    ...mapState(['instructions']),
    instForm() {
      return {...this.instructions };
    },
    readonly() {
      return !this.edit;
    },
  },
  methods: {
    ...mapActions(['setLoading', 'setInstructions']),
    formSubmit() {
      this.setLoading(true);
      axios
        .post('_api/instructions.php', this.instForm)
        .then(res => {
          // console.log(res.data);
          if (res.data[0].id) {
            this.setInstructions(res.data[0]);
            this.setAlert('Instructions updated successfully', 'success');
          } else {
            this.setAlert('Instructions not successfully updated', 'danger');
          }
        })
        .catch(err => this.setAlert(`${err.message}`, 'danger'));
      this.edit = false;
      this.setLoading(false);
    },
  },
};

const SideNav = {
  template: `
		<div :class="navClass" @click="toggleNav" v-show="showNav">	
			<nav class="mb-3 nav-content">
				<b-nav vertical pills>	
					<b-nav-item to="/admin/u/admin"><b-icon icon="people-fill"></b-icon> Admins</b-nav-item>								
					<b-nav-item to="/admin/u/user"><b-icon icon="people"></b-icon> Users</b-nav-item>
					<b-nav-item to="/admin/i"><b-icon icon="info-circle-fill"></b-icon> Instructions</b-nav-item>																
					<b-nav-item-dropdown id="questions">
						<template v-slot:button-content>
							<b-icon icon="question-circle-fill"></b-icon> Questions
						</template>
						<b-dropdown-item to="/admin/q/bop">Best Options</b-dropdown-item>
						<b-dropdown-item to="/admin/q/tof">True or False</b-dropdown-item>
						<b-dropdown-item to="/admin/q/pic">Pictures</b-dropdown-item>
					</b-nav-item-dropdown>
					<b-nav-item-dropdown id="guidelines">
						<template v-slot:button-content>
							<b-icon icon="tools"></b-icon> Setup
						</template>
						<b-dropdown-item to="/admin/s/bop">Best Options</b-dropdown-item>
						<b-dropdown-item to="/admin/s/tof">True or False</b-dropdown-item>
						<b-dropdown-item to="/admin/s/pic">Pictures</b-dropdown-item>
					</b-nav-item-dropdown>					
					<b-nav-item-dropdown id="results" dropup>
						<template v-slot:button-content>
							<b-icon icon="list-check"></b-icon> Results
						</template>
						<b-dropdown-item to="/admin/r/bop">Best Options</b-dropdown-item>
						<b-dropdown-item to="/admin/r/tof">True or False</b-dropdown-item>						
					</b-nav-item-dropdown>				
					<b-nav-item href="#link-"><mini-profile class="d-sm-none"></mini-profile></b-nav-item>
				</b-nav>
			</nav>
		</div>
	`,
  props: {
    toggleVisible: {
      type: Boolean,
      required: true,
    },
    toggleClick: Boolean,
  },
  data() {
    return {
      showNav: false,
      navClass: 'nav-collapse',
    };
  },
  methods: {
    toggleNav() {
      this.toggleVisible ? (this.showNav = !this.showNav) : '';
    },
  },
  watch: {
    toggleVisible(newVal) {
      this.showNav = newVal ? false : true;
      this.navClass = newVal ? 'nav-collapse' : 'nav-expand';
    },
    toggleClick() {
      this.showNav = !this.showNav;
      scroll(0, 0);
    },
  },
};


const AdminPage = {
  // global component
  template: ` 
      <main class="main-container">
				<nav class="d-flex align-items-center flex-nowrap p-0 bg-half-trans navbar sticky-top">
					<main-banner></main-banner>
					<div class="ml-auto">
						<b-button @click="showNav=!showNav" class="btn-success btn-sm d-sm-none p-0 " v-b-visible="toggleNav"><b-icon icon="list"></b-icon></b-button>
						<mini-profile class="d-none d-sm-block"></mini-profile>
					</div>
				</nav>
					<div class="d-flex position-relative mt-2">
						<side-nav v-if="activeUser" :toggleVisible="toggleVisible" :toggleClick="showNav"></side-nav>
						<div class="main-content border-left pl-1">
							<router-view></router-view>
						</div>
					</div>					
          <main-footer></main-footer>				
			</main>`,
  components: { 'side-nav': SideNav },
  data() {
    return {
      showNav: false,
      toggleVisible: true,
    };
  },
  computed: {
    ...mapState(['curUser']),
    ...mapGetters(['userId', 'activeUser']),
  },
  methods: {
    ...mapActions([
      'setCategories',
      'setInstructions',
      'setUsers',
      'setSetup',
      'setQuestnsBop',
      'setQuestnsTof',
      'setQuestnsPic',
      'setAnswersBop',
      'setAnswersTof',
      'setAnswersPic',
    ]),
    toggleNav(isVisible) {
      this.toggleVisible = isVisible;
    },
  },
  created() {
    axios
      .all([
        axios.get('_api/categories.php'),
        axios.get('_api/instructions.php'),
        axios.get('_api/users.php'),
        axios.get('_api/setup.php?_u=2'),
        axios.get('_api/questions_bop.php?_u=2'),
        axios.get('_api/questions_tof.php?_u=2'),
        axios.get('_api/questions_pic.php?_u=2'),
        axios.get(`_api/answers_bop.php?_u=2`),
        axios.get(`_api/answers_tof.php?_u=2`),
        axios.get(`_api/answers_pic.php?_u=2`),
      ])
      .then(
        axios.spread((cat, inst, users, setup, q_bop, q_tof, q_pic, a_bop, a_tof, a_pic) => {
          this.setCategories(cat.data);
          this.setInstructions(inst.data[0]);
          this.setUsers(users.data);
          this.setSetup(setup.data);
          this.setQuestnsBop(q_bop.data);
          this.setQuestnsTof(q_tof.data);
          this.setQuestnsPic(q_pic.data);
          this.setAnswersBop(a_bop.data);
          this.setAnswersTof(a_tof.data);
          this.setAnswersPic(a_pic.data);
        })
      )
      .catch(err => console.error(err));
  },
};

const LoginPage = {
  // global component
  template: `
      <main class="bg-1">
        <div class="mini-container">
          <main-banner class="flex-wrap"></main-banner>
						<h4>Please Login</h4>
						<show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert"></show-alert>	
            <b-form @submit.prevent="processLogin()">
              <b-form-group description="enter user ID" label-for="user-id">
                <b-input-group>
                <b-input-group-prepend is-text><b-icon icon="person"></b-icon></b-input-group-prepend>
                  <b-form-input id="user-id" placeholder="User ID" v-model="regNum" trim required></b-form-input>
                </b-input-group>
              </b-form-group>                              
                <password-input placeholder="Password" description="enter password" v-model.trim="passwd"></password-input>
              <button class="btn btn-success mb-2" type="submit"><b-icon icon="box-arrow-in-right"></b-icon>&nbsp;Login</button>         
            </b-form>
          <main-footer></main-footer>
        </div>
      </main>`,
  mixins: [alertMixin],
  data() {
    return {
      passwd: '',
      regNum: '',
    };
  },
  methods: {
    ...mapActions(['setLoading', 'setLogin', 'setCurUser']),
    processLogin() {
      const userData = {
        regNum: this.regNum,
        passwd: this.passwd,
      };
      this.setLoading(true);
      axios
        .post(`_api/login.php`, userData)
        .then(res => {
          if (res.data.user_id) {
            let cUser = parseInt(res.data.is_admin, 10);
            const curRoute = cUser === 1 ? '/admin' : '/user';
            this.setCurUser(res.data);
            this.setLoading(false);
            this.setLogin(true);
            router.push(curRoute);
          } else {
            this.setAlert('Incorrect UserID/Password.', 'danger');
            this.setLoading(false);
          }
        })
        .catch(err => console.error(err));
      return false;
    },
    countDown(countDown) {
      this.errorCountDown = countDown;
    },
  },
  mounted() {
    this.setLoading(false);
  },
};

const Page404 = {
  // global component
  template: ` 
      <main class="p-2 text-center">
        <main-banner></main-banner>       
					<b-alert show variant="danger">
					<h4 class="alert-heading">Page Not Found</h4> 
					<h5 class="alert-heading">Sorry, we can't find &quot;{{ unknownRoute }}&quot; ?</h5> 
					<p>Kindly follow the right link<p>
					<p><a class="btn btn-success" href="./"><b-icon icon="house-fill"></b-icon> Back to Home</a></p>
				</b-alert>					
        <main-footer></main-footer>				
      </main>`,
  computed: {
    unknownRoute() {
      return this.$route.params.pathMatch.slice(1);
    },
  },
};


const CodeTestingPage = {
  // global component
  template: `
      <main class="bg-1">
        <div class="mini-container">
          <main-banner class="flex-wrap"></main-banner>
						<h4>Code Testing</h4>
						<show-alert :alert-variant="alertVariant" :alert-msg="alertMsg" :show-alert="showAlert"></show-alert>	
            <b-form @submit.prevent="onSubmit">
              <b-form-group description="enter value" label-for="testing-value" label="Value">
                <b-input-group>
                <b-input-group-prepend is-text><b-icon icon="code-square"></b-icon></b-input-group-prepend>
                  <b-form-textarea id="testing-value"  v-model="testingValue.value" trim required></b-form-textarea>
                </b-input-group>
              </b-form-group>                              
              <button class="btn btn-success mb-2" type="submit"><b-icon icon="box-arrow-in-right"></b-icon>&nbsp;Submit</button>         
            </b-form>
            <div>{{ returnValue }}</div>
          <main-footer></main-footer>
        </div>
      </main>`,
  mixins: [alertMixin],
  data() {
    return {
      testingValue: { value: '' },
      returnValue: [],
    };
  },
  methods: {
    ...mapActions(['setLoading']),
    onSubmit() {
      const data = { value: this.testingValue };
      this.setLoading(true);
      axios
        .post(`_api/code_testing.php`, data)
        .then(res => {
          this.setLoading(false);
          console.log(res.data);
          this.returnValue = res.data;
        })
        .catch(err => {
          this.setLoading(false);
          console.error(err);
        });
      this.setLoading(true);
    },
    countDown(countDown) {
      this.errorCountDown = countDown;
    },
  },
};