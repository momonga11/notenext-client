import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.locale('ja');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

export default {
  methods: {
    formatDate(date) {
      return dayjs(date).format('YYYY/MM/DD(ddd) H:mm');
    },
  },
};
