import { Request, Response } from 'express'
import { prisma } from '../services/prisma'

interface FormField {
  field_type: string
  field_name: string
  field_required: boolean
  options?: string[]
}

export const createForm = async (req: any, res: Response) => {
  try {
    await prisma.form.create({
      data: {
        form_name: req.body.form_name,
        form_description: req.body.form_description,
        user_id: req.user.id,
        form_fields: {
          create: req.body.form_fields.map((field: FormField) => ({
            field_type: field.field_type,
            field_required: field.field_required,
            field_name: field.field_name,
            options: field.field_type === 'multiple_choice' || field.field_type === 'dropdown' 
              ? field.options 
              : undefined, // Salva as opções para 'multiple_choice' e 'dropdown'
          })),
        },
      },
    })

    return res.status(201).json({ message: 'Formulário criado com sucesso.' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Erro ao criar formulário.' })
  }
}

export const updateForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {form_fields} = req.body

    for (const field of form_fields) {
      if (field.field_type === 'multiple_choice' || field.field_type === 'dropdown') {
        console.log(field.options)
      }}

     await prisma.form.update({
      where: { id },
      data: {
        form_name: req.body.form_name,
        form_description: req.body.form_description,
      },
    });

    const existingFields = await prisma.formField.findMany({
      where: { formId: id },
    });

    // IDs dos campos enviados no request
    const updatedFieldIds = req.body.form_fields.map((field: any) => field.id);

    // Remover campos que não estão mais no formulário
    const fieldsToRemove = existingFields.filter(
      (field) => !updatedFieldIds.includes(field.id)
    );

    await prisma.formField.deleteMany({
      where: { id: { in: fieldsToRemove.map((field) => field.id) } },
    });

    // Atualizar ou criar campos enviados no request
    for (const field of req.body.form_fields) {
      if (field.id) {
        // Atualizar campo existente
        await prisma.formField.update({
          where: { id: field.id },
          data: {
            field_type: field.field_type,
            field_required: field.field_required,
            field_name: field.field_name,
            options:
              field.field_type === 'multiple_choice' || field.field_type === 'dropdown'
                ? field.options
                : undefined, 
          }
        });
      } else {
        // Criar novo campo
        await prisma.formField.create({
          data: {
            field_name: field.field_name,
            field_type: field.field_type,
            field_required: field.field_required,
            options:
              field.field_type === 'multiple_choice' ? field.options : undefined,
            formId: id,
          },
        });
      }
    }

    return res.status(200).json({
      message: 'Formulário e campos atualizados com sucesso.',
    });
  } catch (error) {
    console.error('Erro ao atualizar o formulário:', error);
    return res.status(500).json({ message: 'Erro ao atualizar o formulário.' });
  }
};



export const deleteForm = async (req: Request, res: Response) => {
  const { id } = req.params

  try {

    const booking = await prisma.booking.findFirst({
      where: {
        formId: id,
      },
    })

    if (booking) {
      return res.status(400).json({ message: 'Este formulário não pode ser deletado pois possui agendamentos associados.' })
    }

    await prisma.form.delete({
      where: { id },
    })

    return res.status(200).json({ message: 'Formulário deletado com sucesso.' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Erro ao deletar formulário.' })
  }
}

export const updateFormStatus = async (req: Request, res: Response) => {
  const { id } = req.params
  const { isActive } = req.body

  try {
    if (isActive) {
      await prisma.form.updateMany({
        where: {
          id: {
            not: id,
          },
        },
        data: {
          isActive: false,
        },
      })
    }

    await prisma.form.update({
      where: {
        id: id,
      },
      data: {
        isActive: isActive,
      },
    })

    return res.status(200).json({ message: 'Atualizado com sucesso' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getAdminForms = async (req: Request, res: Response) => {
  try {
    const forms = await prisma.form.findMany({
      include: { form_fields: true, user: true },
    })

    if (forms.length === 0) {
      return res.status(400).json({ message: 'Nenhum formulário encontrado.' })
    }

    return res.status(200).json(forms)
  } catch (error) {
    console.log(error)
  }
}

export const getUserForms = async (req: Request, res: Response) => {
  try {
    const forms = await prisma.form.findMany({
      where: { isActive: true },
      include: { form_fields: true, user: true },
    })

    if (forms.length === 0) {
      return res.status(400).json({ message: 'Nenhum formulário encontrado.' })
    }

    return res.status(200).json(forms)
  } catch (error) {
    console.log(error)
  }
}



export const getForms = async (req: Request, res: Response) => {
  try {
    const forms = await prisma.form.findMany({
      include: { form_fields: true, user: true },
    });

    if (forms.length === 0) {
      return res.status(400).json({ message: "Nenhum formulário encontrado." });
    }

    return res.status(200).json(forms);
  } catch (error) {
    console.log(error);
  }
};


export const getForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Captura o id da URL
    console.log('form id->',id)
    // Verifique se o id é válido (se necessário)
    if (!id || id.length === 0) {
      console.log('id inválido')
      return res.status(400).json({ message: "ID inválido." });
    }

    // Procure o formulário no banco de dados
    const form = await prisma.form.findUnique({
      where: { id: id }, // Certifique-se de que o campo de ID no banco é do tipo ObjectId
      include: { form_fields: true },
    });
    if (!form) {
      return res.status(404).json({ message: "Formulário não encontrado." });
    }
    console.log(form)
    return res.status(200).json(form);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar o formulário." });
  }
};