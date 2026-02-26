import { notification } from 'antd';
import type { NotificationArgsProps } from 'antd';

type NotificationPlacement = NotificationArgsProps['placement'];
type NotificationType = 'info' | 'success' | 'warning' | 'error';

export const showNotification = (
    placement: NotificationPlacement, 
    type: NotificationType, 
    message: string, description: string,
    duration: number = 1.5
): void => {
    switch (type) {
        case 'info':
            notification.info({
                message,
                description,
                placement,
                duration
            });
            break;
        case 'success':
            notification.success({
                message,
                description,
                placement,
                duration
            });
            break;
        case 'warning':
            notification.warning({
                message,
                description,
                placement,
            });
            break;
        case 'error':
            notification.error({
                message,
                description,
                placement,
            });
            break;
        default:
            notification.info({
                message,
                description,
                placement,
            });
            break;
    }
};
