import { Modal, Form, Input, Button, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const SignupModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const { signup } = useAuth();

  const handleSignup = async (values) => {
    try {
      await signup(values.email, values.password);
      message.success('회원가입 성공!');
      onClose();
    } catch (error) {
      message.error('회원가입 실패: ' + error.message);
    }
  };

  return (
    <Modal
      title="회원가입"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} onFinish={handleSignup}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '이메일을 입력해주세요' },
            { type: 'email', message: '올바른 이메일 형식이 아닙니다' }
          ]}
        >
          <Input placeholder="이메일" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: '비밀번호를 입력해주세요' },
            { min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다' }
          ]}
        >
          <Input.Password placeholder="비밀번호" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '비밀번호를 다시 입력해주세요' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('비밀번호가 일치하지 않습니다'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="비밀번호 확인" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            회원가입
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SignupModal; 