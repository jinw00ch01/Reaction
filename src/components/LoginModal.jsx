import { Modal, Form, Input, Button, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const LoginModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const { login } = useAuth();

  const handleLogin = async (values) => {
    try {
      await login(values.email, values.password);
      message.success('로그인 성공!');
      onClose();
    } catch (error) {
      message.error('로그인 실패: ' + error.message);
    }
  };

  return (
    <Modal
      title="로그인"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} onFinish={handleLogin}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: '이메일을 입력해주세요' }]}
        >
          <Input placeholder="이메일" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
        >
          <Input.Password placeholder="비밀번호" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            로그인
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LoginModal; 