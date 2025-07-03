import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContatoEntity } from './entities/contato.entity';
import { CreateContatoDto } from './dto/create-contato.dto';
import { Assunto } from './enums/assunto.enum';

// Como os Assuntos do enum aparecerão no e-mail
const AssuntoDescricao: Record<Assunto, string> = {
  [Assunto.PARCEIRO]: 'Quero ser um parceiro',
  [Assunto.VOLUNTARIO]: 'Quero ser um voluntário',
  [Assunto.DOACOES]: 'Doações',
  [Assunto.SITE_PROBLEMS]: 'Problemas no site',
  [Assunto.GERAL]: 'Outros',
};

@Injectable()
export class ContatoService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(ContatoEntity)
    private contatoRepository: Repository<ContatoEntity>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    textContent: string,
    htmlContent?: string,
  ) {
    const mailOptions: any = {
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`, // deve ser igual ao auth.user. É o nome e e-mail que você gostaria de mostrar como remetente. Isso será ignorado/sobrescrito pelo Gmail.
      to,
      subject,
      text: textContent,
      //  html: `<h1>Olá!</h1><p>${content}</p>`, // corpo em HTML
    };
    if (htmlContent) mailOptions.html = htmlContent;

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw new InternalServerErrorException('Erro ao enviar e-mail.');
    }
  }

  // Salvamento no banco de dados após chamar o sendEmail, que é quem envia o e-mail.
  async create(createContatoDto: CreateContatoDto): Promise<ContatoEntity> {
    const { name, email, subject, customSubject, message } = createContatoDto;

    const assuntoAmigavel = AssuntoDescricao[subject];

    const fullSubject =
      subject === Assunto.GERAL && customSubject?.trim()
        ? `${assuntoAmigavel} - ${customSubject}`
        : assuntoAmigavel;

    const textContent = `Nome: ${name}
    Email: ${email}
    Assunto: ${fullSubject}
    Mensagem:
    ${message}`;

    const htmlContent = `
      <p><b>Nome:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Assunto:</b> ${fullSubject}</p>
      <p><b>Mensagem:</b><br>${message.replace(/\n/g, '<br>')}</p>
    `;

    // Necessário para não dar erro no TypeORM
    const mailTo = process.env.MAIL_TO;
    if (!mailTo) {
      throw new Error('MAIL_TO não está definido nas variáveis de ambiente');
    }

    try {
      await this.sendEmail(
        mailTo, // Caixa de entrada que receberá os e-mails.
        fullSubject,
        textContent,
        htmlContent,
      );
      const contato = this.contatoRepository.create(createContatoDto);
      return await this.contatoRepository.save(contato);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao processar o contato.');
    }
  }
}
