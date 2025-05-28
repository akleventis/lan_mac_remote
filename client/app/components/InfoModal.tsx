import React from 'react';
import Modal from 'react-modal';
import '../../../client/app/styles.css';

interface InfoModalProps {
    isInfoOpen: boolean;
    setIsInfoOpen: React.Dispatch<React.SetStateAction<boolean>>
}
export const InfoModal = ({
    isInfoOpen,
    setIsInfoOpen
}: InfoModalProps) => {
    const closeModal = () => { setIsInfoOpen(false); }
    return (
        <div>
            <Modal isOpen={isInfoOpen} onRequestClose={closeModal} ariaHideApp={false}>
                <div style={styles.modal}>
                    <ul style={styles.ul}>
                        <li style={styles.li}>
                            <img
                                width='30'
                                height='30'
                                alt='sleep'
                                src={`/images/sleep.png`}
                                style={styles.image}
                            />
                            <span>sleep</span>
                        </li>
                        <li style={styles.li}>
                            <img
                                width='30'
                                height='30'
                                alt='previous track'
                                src={`/images/track-prev.png`}
                                style={styles.image}
                            />
                            <span>previous track</span>
                        </li>
                        <li style={styles.li}>
                            <img
                                width='30'
                                height='30'
                                alt='play/pause'
                                src={`/images/play.png`}
                                style={styles.image}
                            />
                            <span>play/pause</span>
                        </li>
                        <li style={styles.li}>
                            <img
                                width='30'
                                height='30'
                                alt='next track'
                                src={`/images/track-next.png`}
                                style={styles.image}
                            />
                            <span>next track</span>
                        </li>
                        <li style={styles.li}>
                            <img
                                width='30'
                                height='30'
                                alt='brightness up'
                                src={`/images/brightness-up.png`}
                                style={styles.image}
                            />
                            <span>brightness up</span>
                        </li>
                        <li style={styles.li}>
                            <img
                                width='30'
                                height='30'
                                alt='brightness down'
                                src={`/images/brightness-down.png`}
                                style={styles.image}
                            />
                            <span>brightness down</span>
                        </li>
                        <li style={styles.li}>
                            <img
                                width='30'
                                height='30'
                                alt='left arrow key'
                                src={`/images/arrow-left.png`}
                                style={styles.image}
                            />
                            <span>left arrow key</span>
                        </li>
                        <li style={styles.li}>
                            <img
                                width='30'
                                height='30'
                                alt='space'
                                src={`/images/space.png`}
                                style={styles.image}
                            />
                            <span>spacebar</span>
                        </li>
                        <li style={styles.li}>
                            <img
                                width='30'
                                height='30'
                                alt='right arrow key'
                                src={`/images/arrow-right.png`}
                                style={styles.image}
                            />
                            <span>right arrow key</span>
                        </li>
                        <li style={styles.li}>
                            <img
                                width='30'
                                height='30'
                                alt='colorpicker'
                                src={`/images/color-picker.png`}
                                style={styles.image}
                            />
                            <span>color editor</span>
                        </li>
                    </ul>
                </div>
            </Modal>
        </div>
    )
}
const styles = {
    modal: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',  
    },
    ul: {
        display: 'flex',
        flexDirection: 'column' as const, 
        padding: 0,
        color: 'white',
    },
    li: {
        display: 'flex',
        alignItems: 'center',
        margin: '5px'
    },
    image: {
        marginRight: '15px',
    },
};