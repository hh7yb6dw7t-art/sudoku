import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CORRECT_CODE = '321456';
const CODE_LENGTH = 6;
const COOLDOWN_SECONDS = 60;

export default function LoginPage() {
  const { phone: existingPhone } = useAuth();
  const navigate = useNavigate();

  // 已登录则跳转首页
  useEffect(() => {
    if (existingPhone) navigate('/', { replace: true });
  }, [existingPhone, navigate]);

  // ─── 手机号 ───
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // ─── 验证码 ───
  const [otp, setOtp] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(CODE_LENGTH).fill(null));

  // ─── 获取验证码按钮 ───
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── 登录状态 ───
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  // 冷却倒计时
  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown]);

  // 手机号校验
  const validatePhone = useCallback((value: string): boolean => {
    if (value.length !== 11) return false;
    if (!/^1\d{10}$/.test(value)) return false;
    return true;
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPhone(value);
    setPhoneError('');
  };

  const handlePhoneBlur = () => {
    if (phone.length > 0 && !validatePhone(phone)) {
      setPhoneError('请输入正确的 11 位手机号');
    }
  };

  // 获取验证码
  const handleSendCode = () => {
    if (cooldown > 0) return;
    if (!validatePhone(phone)) {
      setPhoneError('请先输入正确的手机号');
      return;
    }
    setPhoneError('');
    setCooldown(COOLDOWN_SECONDS);
    // 聚焦第一个验证码输入格
    inputRefs.current[0]?.focus();
  };

  // 验证码输入处理
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError('');
    // 自动聚焦下一格
    if (index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      const next = [...otp];
      if (otp[index]) {
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        next[index - 1] = '';
        setOtp(next);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < CODE_LENGTH; i++) {
      next[i] = pasted[i] || '';
    }
    setOtp(next);
    setOtpError('');
    // 聚焦到最后一个有值的位置或末尾
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  // 登录
  const handleLogin = async () => {
    if (submitting) return;

    // 再次校验
    if (!validatePhone(phone)) {
      setPhoneError('请输入正确的 11 位手机号');
      return;
    }

    const codeStr = otp.join('');
    if (codeStr.length !== CODE_LENGTH) {
      setOtpError('请输入完整的 6 位验证码');
      return;
    }

    setSubmitting(true);

    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 400));

    if (codeStr === CORRECT_CODE) {
      login(phone);
      // 跳转由 useEffect 监听 existingPhone 变化自动完成，不手动 navigate
    } else {
      setOtpError('验证码错误，请重新输入');
      setOtp(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }

    setSubmitting(false);
  };

  // 表单是否可提交
  const canSubmit =
    validatePhone(phone) && otp.every((d) => d !== '') && !submitting;

  return (
    <div className="h-full flex flex-col px-6 pt-16 pb-10">
      {/* 标题 */}
      <div className="text-center mb-12">
        <div className="text-4xl mb-3">🔢</div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-wider">数独游戏</h1>
        <p className="text-sm text-gray-400 mt-2">每日一局，越玩越聪明</p>
      </div>

      {/* 手机号 */}
      <div className="mb-5">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">📱</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            placeholder="请输入手机号"
            value={phone}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            className={`w-full h-12 pl-10 pr-4 text-base rounded-lg border-2 outline-none transition-colors
              ${phoneError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}
          />
        </div>
        {phoneError && <p className="mt-1.5 text-sm text-red-500 ml-1">{phoneError}</p>}
      </div>

      {/* 验证码行 */}
      <div className="flex gap-3 mb-2">
        <div className="flex gap-2 flex-1">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              onPaste={i === 0 ? handleOtpPaste : undefined}
              className={`otp-box flex-1 ${otpError ? 'border-red-400 bg-red-50' : ''}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleSendCode}
          disabled={cooldown > 0 || !validatePhone(phone)}
          className={`shrink-0 h-12 px-4 text-sm font-medium rounded-lg border-2 transition-colors whitespace-nowrap
            ${cooldown > 0 || !validatePhone(phone)
              ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
              : 'border-blue-400 text-blue-600 bg-blue-50 active:bg-blue-100'}`}
        >
          {cooldown > 0 ? `${cooldown}s 后重发` : '获取验证码'}
        </button>
      </div>
      {otpError && <p className="mb-1 text-sm text-red-500 ml-1">{otpError}</p>}

      {/* 登录按钮 */}
      <button
        type="button"
        onClick={handleLogin}
        disabled={!canSubmit}
        className={`w-full h-12 rounded-lg text-lg font-semibold tracking-widest mt-7 transition-colors
          ${canSubmit
            ? 'bg-blue-500 text-white active:bg-blue-600'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            登录中...
          </span>
        ) : (
          '登  录'
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-5">首次登录即自动注册</p>
      <p className="text-center text-xs text-orange-400 mt-2 bg-orange-50 rounded-md py-1.5 mx-4">
        💡 验证码：<b className="text-orange-600 tracking-widest">321456</b>（模拟登录，无需短信）
      </p>
    </div>
  );
}
